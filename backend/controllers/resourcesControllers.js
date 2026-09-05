const supabase = require('../supabase/client');
const validationResult = require('express-validator').validationResult;

const isUuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// lowercase, dash-joined — "How to Prepare Your Home" → "how-to-prepare-your-home"
const slugify = (text) => String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

exports.getResources = async (req, res) => {
    const { category } = req.query;
    try {
        let query = supabase.from('resources')
        .select('id, title, slug, category, cover_url, created_at')
        .order('created_at', { ascending: false });
        // listing omits `body` — the heavy markdown — per the spec
        if (category) query = query.eq('category', category);

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching resources:', error);
            return res.status(500).json({ error: 'Error fetching resources' });
        }
        return res.status(200).json({ resources: data });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Error fetching resources' });
    }
};

exports.getResourceById = async (req, res) => {
    const { slug } = req.params;
    try {
        const { data, error } = await supabase.from('resources')
        .select('*')
        .eq('slug', slug)
        .single();
        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Resource not found' });
        }
        if (error) {
            console.error('Error fetching resource:', error);
            return res.status(500).json({ error: 'Error fetching resource' });
        }
        return res.status(200).json({ resource: data });
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: 'Error fetching resource' });
    }
};

exports.postResource = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, category, slug, body, cover_url } = req.body;
    try {
        // slug is auto-generated from the title when the client doesn't send one
        const finalSlug = slug || slugify(title);
        const { data, error } = await supabase.from('resources')
        .insert([{ title, category, slug: finalSlug, body: body || null, cover_url: cover_url || null }])
        .select()
        .single();
        if (error && error.code === '23505') {
            return res.status(409).json({ error: 'A resource with this slug already exists' });
        }
        if (error) {
            console.error('Error creating resource:', error);
            return res.status(500).json({ error: 'Error creating resource' });
        }
        return res.status(201).json({ resource: data });
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: 'Error creating resource' });
    }
};

exports.updateResource = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid resource ID' });
    }

    const { title, category, slug, body, cover_url } = req.body;
    try {
        // Build the update from only the fields actually provided
        const updates = {};
        for (const [key, value] of Object.entries({ title, category, slug, body, cover_url })) {
            if (value !== undefined && value !== null) updates[key] = value;
        }
        // Title change without an explicit slug → regenerate the slug from the new title
        if (title && slug === undefined) updates.slug = slugify(title);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const { data, error } = await supabase.from('resources')
        .update(updates)
        .eq('id', id)
        .select();
        if (error && error.code === '23505') {
            return res.status(409).json({ error: 'A resource with this slug already exists' });
        }
        if (error) {
            console.error('Error updating resource:', error);
            return res.status(500).json({ error: 'Error updating resource' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        return res.status(200).json({ resource: data[0] });
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ error: 'Error updating resource' });
    }
};

exports.deleteResource = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) {
        return res.status(400).json({ error: 'Invalid resource ID' });
    }
    try {
        const { data, error } = await supabase.from('resources')
        .delete()
        .eq('id', id)
        .select();
        if (error) {
            console.error('Error deleting resource:', error);
            return res.status(500).json({ error: 'Error deleting resource' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        return res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        res.status(500).json({ error: 'Error deleting resource' });
    }
};