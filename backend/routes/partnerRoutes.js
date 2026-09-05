const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerControllers');
const { body, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/', partnerController.getPartners);

router.get('/:id', partnerController.getPartnerById);

const partnerBody = [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('phone').optional().isString(),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('about').optional().isString(),
    body('logo_url').optional().isURL().withMessage('logo_url must be a valid URL'),
];

router.post('/', requireRole('partner'), partnerBody, validate, partnerController.postPartner);

router.patch('/:id', requireRole('partner'), [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('type').optional().isIn(['shelter', 'vet', 'ngo']).withMessage('Type must be shelter, vet or ngo'),
    body('address').optional().isString(),
    body('city').optional().isString(),
    body('phone').optional().isString(),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('about').optional().isString(),
    body('logo_url').optional().isURL().withMessage('logo_url must be a valid URL'),
], validate, partnerController.patchPartner);

module.exports = router;
