const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationControllers');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/authMiddleware');
const { requireRole } = requireAuth;

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.post('/', requireAuth, [
    body('pet_id').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).withMessage('Valid pet_id is required'),
    body('message').optional().isString().trim().isLength({ max: 2000 }).withMessage('Message must be at most 2000 characters'),
    body('phone').notEmpty().withMessage('Phone is required'),
    // note: no `status` validation on purpose — status is server-controlled (always pending)
], validate, applicationController.submitApplication);

router.get('/mine', requireAuth, applicationController.getMyApplications);

router.get('/partner', requireRole('partner'), applicationController.getPartnerApplications);

router.patch('/:id', requireRole('partner'), [
    body('status').isIn(['approved', 'rejected']).withMessage('status must be approved or rejected'),
], validate, applicationController.updateApplicationStatus);

module.exports = router;
