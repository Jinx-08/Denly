const supabase = require('../supabase/client');
const { validationResult } = require('express-validator');

// Order of appointment statuses — transitions may only step one at a time
const STATUS_FLOW = { pending: 1, confirmed: 2, done: 3 };

// Person 2 owns backend/services/mailer.js — may not exist yet. Emails are
// best-effort; a missing/failing mailer must never fail the API request.
const sendConfirmationEmail = async (to, payload) => {
    try {
        const mailer = require('../services/mailer');
        await mailer.appointmentConfirmedEmail(to, payload);
    } catch (err) {
        console.warn('[mailer] skipped (not shipped yet or failed):', err.message || err);
    }
};

// Resolve the caller's org id from the token. Returns { id } or null if none.
const getPartnerOrgId = async (req, res) => {
    const { data: partner, error } = await supabase
        .from('partners')
        .select('id, name')
        .eq('owner_id', req.user.userId)
        .single();
    if (error && error.code === 'PGRST116') {
        res.status(404).json({ error: 'Create your organization first' });
        return null;
    }
    if (error) {
        console.error('Error fetching partner:', error);
        res.status(500).json({ error: 'Error fetching appointments' });
        return null;
    }
    return partner;
};

exports.createAppointment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { partner_id, full_name, phone, type, preferred_date, notes } = req.body;
    try {
        // Partner org must exist
        const { data: partner, error: partnerError } = await supabase
            .from('partners')
            .select('id, name')
            .eq('id', partner_id)
            .single();
        if (partnerError && partnerError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Partner not found' });
        }
        if (partnerError) {
            console.error('Error fetching partner:', partnerError);
            return res.status(500).json({ error: 'Error booking appointment' });
        }

        // Optional token linking: if a Bearer header is present, verify it and
        // link the user — but a bad/expired token must NOT block a public booking.
        let user_id = null;
        const authorization = req.get('authorization');
        const token = authorization && authorization.startsWith('Bearer ')
            ? authorization.slice(7)
            : null;
        if (token) {
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data && data.user) {
                // only link if a profile row exists (appointments.user_id FK)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .maybeSingle();
                if (profile) user_id = profile.id;
            }
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert([{ partner_id, user_id, full_name, phone, type, preferred_date, notes: notes || null }])
            .select('id, partner_id, user_id, full_name, phone, type, preferred_date, notes, status, created_at')
            .single();
        if (error) {
            console.error('Error creating appointment:', error);
            return res.status(500).json({ error: 'Error booking appointment' });
        }
        return res.status(201).json({ appointment: data });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Error booking appointment' });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('id, full_name, phone, type, preferred_date, notes, status, created_at, partner_id (id, name, city)')
            .eq('user_id', req.user.userId)
            .order('preferred_date', { ascending: true });
        if (error) {
            console.error('Error fetching appointments:', error);
            return res.status(500).json({ error: 'Error fetching appointments' });
        }
        return res.status(200).json({ appointments: data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
};

exports.getPartnerAppointments = async (req, res) => {
    try {
        const partner = await getPartnerOrgId(req, res);
        if (!partner) return;

        const { data, error } = await supabase
            .from('appointments')
            .select('id, full_name, phone, type, preferred_date, notes, status, created_at, user_id (full_name, phone)')
            .eq('partner_id', partner.id)
            .order('preferred_date', { ascending: true });
        if (error) {
            console.error('Error fetching partner appointments:', error);
            return res.status(500).json({ error: 'Error fetching appointments' });
        }
        return res.status(200).json({ appointments: data });
    } catch (error) {
        console.error('Error fetching partner appointments:', error);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' | 'done' — validated in the route
    try {
        const partner = await getPartnerOrgId(req, res);
        if (!partner) return;

        const { data: appointment, error: apptError } = await supabase
            .from('appointments')
            .select('id, status, partner_id, user_id, type, preferred_date')
            .eq('id', id)
            .single();
        if (apptError && apptError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        if (apptError) {
            console.error('Error fetching appointment:', apptError);
            return res.status(500).json({ error: 'Error updating appointment' });
        }

        // Ownership: this appointment must belong to the caller's org
        if (appointment.partner_id !== partner.id) {
            return res.status(403).json({ error: 'Forbidden: this appointment is not for your organization' });
        }

        // One-way state machine: only the immediate next state is allowed
        const current = STATUS_FLOW[appointment.status];
        const next = STATUS_FLOW[status];
        if (next !== current + 1) {
            return res.status(409).json({
                error: `Cannot move appointment from '${appointment.status}' to '${status}'`,
            });
        }

        const { data, error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id)
            .select('id, full_name, user_id, type, preferred_date, status')
            .single();
        if (error) {
            console.error('Error updating appointment:', error);
            return res.status(500).json({ error: 'Error updating appointment' });
        }

        // Notify the booker when confirming (best-effort). Anonymous bookings
        // have no email — nothing to send, just log.
        if (status === 'confirmed') {
            const { data: applicant } = appointment.user_id
                ? await supabase.auth.admin.getUserById(appointment.user_id).catch(() => ({ data: { user: null } }))
                : { data: { user: null } };
            await sendConfirmationEmail(applicant && applicant.user && applicant.user.email, {
                partnerName: partner.name,
                date: appointment.preferred_date,
                type: appointment.type,
            });
        }

        return res.status(200).json({ appointment: data });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Error updating appointment' });
    }
};
