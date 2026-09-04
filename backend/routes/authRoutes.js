const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['adopter', 'partner']).withMessage('Role must be adopter or partner'),

], authController.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], authController.loginUser);

router.get('/profile', authMiddleware, authController.getProfile);

router.post('/logout', authMiddleware, authController.logoutUser);

module.exports = router;