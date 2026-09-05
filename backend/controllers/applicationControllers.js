const supabase = require('../supabase/client');
const { validationResult } = require('express-validator');


const sendDecisionEmail = async (to, payload) => {
    try {
        const mailer = require('../services/mailer');
        await mailer.applicationDecisionEmail(to, payload);
    } catch (err) {
        console.warn('[mailer] skipped (not shipped yet or failed):', err.message || err);
    }
};

exports.submitApplication = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { pet_id, message, phone } = req.body;
    try {
        const { data: pet, error: petError } = await supabase
            .from('pets')
            .select('id, name, status')
            .eq('id', pet_id)
            .single();
        if (petError && petError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Pet not found' });
        }
        if (petError) {
            console.error('Error fetching pet for application:', petError);
            return res.status(500).json({ error: 'Error submitting application' });
        }
        if (pet.status !== 'available') {
            return res.status(409).json({ error: 'Pet is not available for adoption' });
        }

        const { data, error } = await supabase
            .from('adoption_applications')
            .insert([{ pet_id, user_id: req.user.userId, message, phone }])
            .select('id, pet_id, user_id, message, phone, status, created_at')
            .single();
        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'You have already applied for this pet' });
            }
            console.error('Error submitting application:', error);
            return res.status(500).json({ error: 'Error submitting application' });
        }
        return res.status(201).json({ application: data });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Error submitting application' });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('adoption_applications')
            .select('id, message, phone, status, created_at, pet_id (id, name, species, breed, image_url, status)')
            .eq('user_id', req.user.userId)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching applications:', error);
            return res.status(500).json({ error: 'Error fetching applications' });
        }
        return res.status(200).json({ applications: data });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Error fetching applications' });
    }
};

exports.getPartnerApplications = async (req, res) => {
    try {
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('id')
            .eq('owner_id', req.user.userId)
            .single();
        if (partnerError && partnerError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Create your organization first' });
        }
        if (partnerError) {
            console.error('Error fetching partner:', partnerError);
            return res.status(500).json({ error: 'Error fetching applications' });
        }

        const { data, error } = await supabase
            .from('adoption_applications')
            .select('id, message, phone, status, created_at, pet_id (id, name, species, breed, image_url, status), user_id (full_name, phone)')
            .eq('pet_id.partner_id', partner.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching partner applications:', error);
            return res.status(500).json({ error: 'Error fetching applications' });
        }
        return res.status(200).json({ applications: data });
    } catch (error) {
        console.error('Error fetching partner applications:', error);
        res.status(500).json({ error: 'Error fetching applications' });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' only — validated in the route
    try {
        // (1) fetch the application + its pet + the pet's org owner.
        // Only the EMBEDDED pet_id is selected — the bare column would be
        // shadowed by the embed and end up as an object, not a UUID.
        const { data: application, error: appError } = await supabase
            .from('adoption_applications')
            .select('id, status, user_id, pet_id (id, name, status, partner_id (owner_id))')
            .eq('id', id)
            .single();
        if (appError && appError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Application not found' });
        }
        if (appError) {
            console.error('Error fetching application:', appError);
            return res.status(500).json({ error: 'Error updating application' });
        }
        const pet = Array.isArray(application.pet_id) ? application.pet_id[0] : application.pet_id;
        const partner = pet ? (Array.isArray(pet.partner_id) ? pet.partner_id[0] : pet.partner_id) : null;
        if (!partner || partner.owner_id !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden: this application is not for your pets' });
        }

        if (application.status !== 'pending') {
            return res.status(409).json({ error: 'Application has already been decided' });
        }

        if (status === 'approved') {
            // (4) approve: app → approved, pet → adopted, other pending apps for that pet → rejected
            const { error: petError } = await supabase
                .from('pets')
                .update({ status: 'adopted' })
                .eq('id', pet.id);
            if (petError) {
                console.error('Error updating pet status:', petError);
                return res.status(500).json({ error: 'Error updating application' });
            }

            const { error: rejectError } = await supabase
                .from('adoption_applications')
                .update({ status: 'rejected' })
                .eq('pet_id', pet.id)
                .eq('status', 'pending')
                .neq('id', id);
            if (rejectError) {
                console.error('Error rejecting other applications:', rejectError);
                return res.status(500).json({ error: 'Error updating application' });
            }
        }


        const { data, error } = await supabase
            .from('adoption_applications')
            .update({ status })
            .eq('id', id)
            .select('id, pet_id, user_id, status')
            .single();
        if (error) {
            console.error('Error updating application:', error);
            return res.status(500).json({ error: 'Error updating application' });
        }

        // (6) notify the ADOPTER (best-effort — never fails the request).
        // The email lives on the auth user, not the profile.
        const { data: applicant } = await supabase.auth.admin
            .getUserById(application.user_id)
            .catch(() => ({ data: { user: null } }));
        await sendDecisionEmail(applicant && applicant.user && applicant.user.email, {
            petName: pet ? pet.name : 'your pet application',
            approved: status === 'approved',
        });

        return res.status(200).json({ application: data });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Error updating application' });
    }
};
