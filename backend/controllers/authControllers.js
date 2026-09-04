const supabase = require('../supabase/client');
const supabaseAuth = require('../supabase/authclient');
const { validationResult } = require('express-validator');

const VALID_ROLES = ['adopter', 'partner'];

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { data, error } = await supabaseAuth.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: VALID_ROLES.includes(role) ? role : 'adopter',
                },
            },
        });
        if (error) {
            return res.status(400).json({ error: error.message || 'Error creating user' });
        }

        return res.status(201).json({ 
            message: 'User registered successfully', 
            user: data.user,
            session: data.session,
        });
    }catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
};

exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return res.status(401).json({ error: error.message || 'Invalid email or password' });
        }
        return res.status(200).json({
            message: 'User logged in successfully',
            user: data.user,
            session: data.session,
        });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Error logging in user' });
    }
};  

exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Profile not found' });
        }
        if (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({ error: 'Error fetching user profile' });
        }

        return res.status(200).json(data);
    }catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error fetching user profile' });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const { error } = await supabase.auth.admin.signOut(req.accessToken);
        if (error) {
            return res.status(400).json({ error: error.message || 'Error logging out user' });
        }

        return res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        return res.status(500).json({ error: 'Error logging out user' });
    }
};

