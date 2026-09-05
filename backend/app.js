const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const resourcesRoutes = require('./routes/resourcesRoutes');
const adminRoutes = require('./routes/adminRoutes');

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
	res.json({ ok: true });
});

// JSON 404 for any unmatched /api route (falls through to the HTML catch-all below
// for non-API paths so the root/landing routes keep working)
app.use('/api', (req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// Global error handler — keeps error responses JSON for API clients
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(err.status || 500).json({ error: 'Internal server error' });
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

module.exports = app;
