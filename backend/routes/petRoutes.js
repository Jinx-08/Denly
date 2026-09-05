const express = require('express');
const router = express.Router();
const multer = require('multer');
const petController = require('../controllers/petControllers');
const { body, query, validationResult } = require('express-validator');
const { requireRole } = require('../middleware/authMiddleware');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
    query('vaccinated').optional().isIn(['true', 'false']).withMessage('vaccinated must be true or false'),
    query('sterilized').optional().isIn(['true', 'false']).withMessage('sterilized must be true or false'),
    query('status').optional().isIn(['available', 'pending', 'adopted']).withMessage('status is invalid'),
], validate, petController.getAllPets);

router.get('/:id', petController.getPetById);

router.post('/', requireRole('partner'), [
    body('name').notEmpty().withMessage('Name is required'),
    body('species').notEmpty().withMessage('Species is required'),
    body('age_months').optional().isInt({ min: 0 }).withMessage('age_months must be a non-negative integer'),
    body('gender').optional().isIn(['male', 'female', 'unknown']).withMessage('Gender must be male, female or unknown'),
    body('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium or large'),
    body('is_vaccinated').optional().isBoolean().withMessage('is_vaccinated must be a boolean'),
    body('is_sterilized').optional().isBoolean().withMessage('is_sterilized must be a boolean'),
], validate, petController.createPet);

const petBodyUpdates = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('species').optional().notEmpty().withMessage('Species cannot be empty'),
    body('age_months').optional().isInt({ min: 0 }).withMessage('age_months must be a non-negative integer'),
    body('gender').optional().isIn(['male', 'female', 'unknown']).withMessage('Gender must be male, female or unknown'),
    body('size').optional().isIn(['small', 'medium', 'large']).withMessage('Size must be small, medium or large'),
    body('is_vaccinated').optional().isBoolean().withMessage('is_vaccinated must be a boolean'),
    body('is_sterilized').optional().isBoolean().withMessage('is_sterilized must be a boolean'),
    body('status').optional().isIn(['available', 'pending', 'adopted']).withMessage('status is invalid'),
];

router.patch('/:id', requireRole('partner'), petBodyUpdates, validate, petController.updatePet);
router.delete('/:id', requireRole('partner'), petController.deletePet);

// Image upload: memory storage, image/* mimetypes only, 5MB limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    },
});

// Translate multer rejections (mimetype, size) into a JSON 400 instead of Express's HTML error page
const uploadImage = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5MB or smaller'
                : err.message;
            return res.status(400).json({ error: message });
        }
        next();
    });
};

router.post('/:id/image', requireRole('partner'), uploadImage, petController.updatePetImage);

module.exports = router;
