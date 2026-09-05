const supabase = require('../supabase/client');

module.exports = async (req, res, next) => {
	const authorization = req.get('authorization');
	const token = authorization && authorization.startsWith('Bearer ')
		? authorization.slice(7)
		: null;

	if (!token) {
		return res.status(401).json({ error: 'Authorization token is required' });
	}

	const { data, error } = await supabase.auth.getUser(token);
	if (error || !data.user) {
		return res.status(401).json({ error: 'Invalid or expired authorization token' });
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', data.user.id)
		.single();

	if (profileError) {
		console.error('Error fetching profile:', profileError);
		return res.status(500).json({ error: 'Error fetching user profile' });
	}

	req.user = { userId: data.user.id, email: data.user.email, role: profile.role };
	req.accessToken = token;
	return next();
};

module.exports.requireRole = (role) => (req, res, next) => {
	if (req.user?.role !== role) {
		return res.status(403).json({ error: 'Forbidden: insufficient role' });
	}
	return next();
};
