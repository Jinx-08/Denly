const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllers');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/stats', requireRole('admin'), adminController.getStatistics);

router.get('/pets', requireRole('admin'), adminController.getPets);

router.get('/applications', requireRole('admin'), adminController.getApplications);

router.get('/partners', requireRole('admin'), adminController.getPartners);

router.delete('/pets/:id', requireRole('admin'), adminController.deletePets);

router.delete('/applications/:id', requireRole('admin'), adminController.deleteApplications);

router.patch('/partners/:id', requireRole('admin'), [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], validate, adminController.patchPartners);

module.exports = router;
