const supabase = require('../supabase/client');

// Whitelisted fields a partner may update on a pet (never partner_id — ownership is fixed at creation)
const UPDATABLE_FIELDS = [
    'name', 'species', 'breed', 'age_months', 'gender', 'size',
    'is_vaccinated', 'is_sterilized', 'description', 'image_url', 'status',
];

// Fetch the pet plus its owner_id (via the owning partner). Returns null if pet not found.
const fetchPetWithOwnerId = async (id) => {
    const { data, error } = await supabase
        .from('pets')
        .select('id, partner_id, partner_id (owner_id)')
        .eq('id', id)
        .single();
    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data;
};

// Shared ownership check for partner mutations on a pet.
// Admins bypass (they can manage any pet); otherwise the pet's partner.owner_id must match the caller.
const assertPetOwnership = async (req, res) => {
    const pet = await fetchPetWithOwnerId(req.params.id);
    if (!pet) {
        res.status(404).json({ error: 'Pet not found' });
        return { pet: null };
    }
    if (req.user.role === 'admin') return { pet };

    const partner = Array.isArray(pet.partner_id) ? pet.partner_id[0] : pet.partner_id;
    if (!partner || partner.owner_id !== req.user.userId) {
        res.status(403).json({ error: 'Forbidden: you do not own this pet' });
        return { pet: null };
    }
    return { pet };
};

exports.getAllPets = async (req, res) => {
    try {
        const { species, city, vaccinated, sterilized, status, q } = req.query;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

        // !inner: without it, filtering on partner_id.city would null the embed
        // instead of excluding the pet (PostgREST left-join behavior)
        let query = supabase
            .from('pets')
            .select('*, partner_id!inner (id, name, city, type)', { count: 'exact' })
            .eq('status', status || 'available');

        if (species) query = query.eq('species', species);
        if (city) query = query.eq('partner_id.city', city);
        if (vaccinated === 'true') query = query.eq('is_vaccinated', true);
        if (vaccinated === 'false') query = query.eq('is_vaccinated', false);
        if (sterilized === 'true') query = query.eq('is_sterilized', true);
        if (sterilized === 'false') query = query.eq('is_sterilized', false);
        if (q) {
            query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%,description.ilike.%${q}%`);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Error fetching pets:', error);
            return res.status(500).json({ error: 'Error fetching pets' });
        }

        return res.status(200).json({
            pets: data,
            total: count,
            page,
            totalPages: Math.max(Math.ceil((count || 0) / limit), 1),
        });
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Error fetching pets' });
    }
};

exports.getPetById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('pets')
            .select('*, partner_id (*)')
            .eq('id', id)
            .single();
        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Pet not found' });
        }
        if (error) {
            console.error('Error fetching pet:', error);
            return res.status(500).json({ error: 'Error fetching pet' });
        }
        return res.status(200).json({ pet: data });
    } catch (error) {
        console.error('Error fetching pet:', error);
        res.status(500).json({ error: 'Error fetching pet' });
    }
};

exports.createPet = async (req, res) => {
    const { name, species, breed, age_months, gender, size,
        is_vaccinated, is_sterilized, description, image_url } = req.body;
    try {
        // Resolve the caller's organization — partner_id is never trusted from the body
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
            return res.status(500).json({ error: 'Error creating pet' });
        }

        const { data, error } = await supabase
            .from('pets')
            .insert([{
                partner_id: partner.id,
                name,
                species,
                breed: breed || null,
                age_months: age_months ?? null,
                gender: gender || 'unknown',
                size: size || 'medium',
                is_vaccinated: is_vaccinated ?? false,
                is_sterilized: is_sterilized ?? false,
                description: description || null,
                image_url: image_url || null,
            }])
            .select('*, partner_id (id, name, city, type)')
            .single();
        if (error) {
            console.error('Error creating pet:', error);
            return res.status(500).json({ error: 'Error creating pet' });
        }
        return res.status(201).json({ pet: data });
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ error: 'Error creating pet' });
    }
};

exports.updatePet = async (req, res) => {
    const { id } = req.params;
    try {
        const { pet } = await assertPetOwnership(req, res);
        if (!pet) return;

        const updates = {};
        for (const field of UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updatable fields provided' });
        }

        // .update().select() returns [] (not an error) on a missing row — hence the fetch above
        const { data, error } = await supabase
            .from('pets')
            .update(updates)
            .eq('id', id)
            .select('*, partner_id (id, name, city, type)');
        if (error) {
            console.error('Error updating pet:', error);
            return res.status(500).json({ error: 'Error updating pet' });
        }
        return res.status(200).json({ pet: data[0] });
    } catch (error) {
        console.error('Error updating pet:', error);
        res.status(500).json({ error: 'Error updating pet' });
    }
};

exports.deletePet = async (req, res) => {
    const { id } = req.params;
    try {
        const { pet } = await assertPetOwnership(req, res);
        if (!pet) return;

        const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting pet:', error);
            return res.status(500).json({ error: 'Error deleting pet' });
        }
        return res.status(200).json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ error: 'Error deleting pet' });
    }
};

exports.updatePetImage = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const { pet } = await assertPetOwnership(req, res);
        if (!pet) return;

        // Unique path so re-uploads never collide; extension comes from the mimetype-checked original name
        const ext = (req.file.originalname.split('.').pop() || 'png').toLowerCase();
        const path = `${id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('pet-images')
            .upload(path, req.file.buffer, { contentType: req.file.mimetype });
        if (uploadError) {
            console.error('Error uploading pet image:', uploadError);
            return res.status(500).json({ error: 'Error uploading pet image' });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('pet-images')
            .getPublicUrl(path);

        const { data, error } = await supabase
            .from('pets')
            .update({ image_url: publicUrl })
            .eq('id', id)
            .select('id, image_url');
        if (error) {
            console.error('Error updating pet image:', error);
            return res.status(500).json({ error: 'Error updating pet image' });
        }
        return res.status(200).json({ image_url: data[0].image_url });
    } catch (error) {
        console.error('Error updating pet image:', error);
        res.status(500).json({ error: 'Error updating pet image' });
    }
};
