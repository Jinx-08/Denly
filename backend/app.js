const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
	res.json({ ok: true });
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

module.exports = app;
