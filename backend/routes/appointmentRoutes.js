const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentControllers');
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

// Booking a date in the past is rejected — evaluated at request time so it
// can't go stale. Uses UTC-truncated dates: today in UTC is accepted, and the
// controller stores the date as a bare `date` (no time component).
const notInPast = (value) => {
    const today = new Date();
    const booked = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(booked.getTime())) return false;
    return booked.getTime() >= Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
};

// Public: logged-out bookings allowed. An Authorization header, if present,
// is verified opportunistically in the controller to link user_id.
router.post('/', [
    body('partner_id').matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).withMessage('Valid partner_id is required'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('type').isIn(['vaccination', 'sterilization', 'checkup']).withMessage('Type must be vaccination, sterilization or checkup'),
    body('preferred_date').isISO8601({ strict: true }).withMessage('preferred_date must be a valid date (YYYY-MM-DD)')
        .custom(notInPast).withMessage('preferred_date cannot be in the past'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }).withMessage('Notes must be at most 1000 characters'),
], validate, appointmentController.createAppointment);

router.get('/mine', requireAuth, appointmentController.getMyAppointments);

router.get('/partner', requireRole('partner'), appointmentController.getPartnerAppointments);

// Status may only be advanced one step: pending → confirmed → done
router.patch('/:id', requireRole('partner'), [
    body('status').isIn(['confirmed', 'done']).withMessage('status must be confirmed or done'),
], validate, appointmentController.updateAppointmentStatus);

module.exports = router;
