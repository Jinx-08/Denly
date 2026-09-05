const supabase = require('../supabase/client');
const validationResult = require('express-validator').validationResult;

const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

exports.getPartners = async (req, res) => {
    const { type, city } = req.query;
    try {
        // pets (id) embed filtered to available = the org's available-pet counter;
        // left-join semantics keep orgs with zero available pets (pets: [])
        let query = supabase.from('partners')
            .select('id, name, type, address, city, phone, email, about, logo_url, pets (id)')
            .order('created_at', { ascending: false })
            .eq('pets.status', 'available');
        if (type) query = query.eq('type', type);
        if (city) query = query.ilike('city', `%${city}%`);

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching partners:', error);
            return res.status(500).json({ error: 'Error fetching partners' });
        }
        // partners with zero available pets — the embed returns [] but count
        // comes back globally, so compute per-partner from the embed length
        const partners = data.map((p) => {
            const available = (p.pets || []).length;
            const { pets, ...rest } = p;
            return { ...rest, pets_available: available };
        });
        return res.status(200).json({ partners });
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Error fetching partners' });
    }
};

exports.getPartnerById = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid partner ID' });
    }
    try {
        const { data, error } = await supabase.from('partners')
            .select('*, pets (id)')
            .eq('id', id)
            .eq('pets.status', 'available')
            .single();
        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Partner not found' });
        }
        if (error) {
            console.error('Error fetching partner by ID:', error);
            return res.status(500).json({ error: 'Error fetching partner by ID' });
        }
        const { pets, ...partner } = data;
        return res.status(200).json({ partner: { ...partner, pets_available: (pets || []).length } });
    } catch (error) {
        console.error('Error fetching partner by ID:', error);
        res.status(500).json({ error: 'Error fetching partner by ID' });
    }
};

exports.postPartner = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, address, city, phone, email, about, logo_url } = req.body;
    try {
        // One org per owner — the spec's mandatory guard
        const { data: existing, error: existingError } = await supabase.from('partners')
            .select('id')
            .eq('owner_id', req.user.userId)
            .maybeSingle();
        if (existingError) {
            console.error('Error checking existing partner:', existingError);
            return res.status(500).json({ error: 'Error creating partner' });
        }
        if (existing) {
            return res.status(409).json({ error: 'You already have an organization' });
        }

        const { data, error } = await supabase.from('partners')
            .insert([{ owner_id: req.user.userId, name, type, address, city, phone, email, about, logo_url }])
            .select()
            .single();
        if (error) {
            console.error('Error creating partner:', error);
            return res.status(500).json({ error: 'Error creating partner' });
        }
        return res.status(201).json({ message: 'Partner created successfully', partner: data });
    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ error: 'Error creating partner' });
    }
};

exports.patchPartner = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid partner ID' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, address, city, phone, email, about, logo_url } = req.body;
    try {
        // Build the update from only the fields actually provided
        const updates = {};
        for (const [key, value] of Object.entries({ name, type, address, city, phone, email, about, logo_url })) {
            if (value !== undefined && value !== null) updates[key] = value;
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const { data: partner, error: fetchError } = await supabase.from('partners')
            .select('id, owner_id')
            .eq('id', id)
            .single();
        if (fetchError && fetchError.code === 'PGRST116') {
            return res.status(404).json({ error: 'Partner not found' });
        }
        if (fetchError) {
            console.error('Error fetching partner:', fetchError);
            return res.status(500).json({ error: 'Error updating partner' });
        }
        if (partner.owner_id !== req.user.userId) {
            return res.status(403).json({ error: 'Forbidden: you do not own this organization' });
        }

        const { data, error } = await supabase.from('partners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('Error updating partner:', error);
            return res.status(500).json({ error: 'Error updating partner' });
        }
        return res.status(200).json({ message: 'Partner updated successfully', partner: data });
    } catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({ error: 'Error updating partner' });
    }
};

