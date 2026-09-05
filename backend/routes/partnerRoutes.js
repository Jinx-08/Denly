const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerControllers');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = authMiddleware;

router.get('/', partnerController.getPartners);

router.get('/:id', partnerController.getPartnerById);

router.post('/', authMiddleware, requireRole('partner'), [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], partnerController.postPartner);

router.patch('/:id', authMiddleware, requireRole('partner'), [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
], partnerController.patchPartner);

module.exports = router;
