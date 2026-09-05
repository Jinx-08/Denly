const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = authMiddleware;

router.get('/statistics', authMiddleware, requireRole('admin'), adminController.getStatistics);

router.get('/pets', authMiddleware, requireRole('admin'), adminController.getpets);

router.get('/applications', authMiddleware, requireRole('admin'), adminController.getApplications);

router.get('/partners', authMiddleware, requireRole('admin'), adminController.getPartners);

router.delete('/pets/:id', authMiddleware, requireRole('admin'), adminController.deletePets);

router.delete('/applications/:id', authMiddleware, requireRole('admin'), adminController.deleteApplications);

router.patch('/partners/:id', authMiddleware, requireRole('admin'), [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], adminController.patchPartners);

module.exports = router;