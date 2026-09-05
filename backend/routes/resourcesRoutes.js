const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesControllers');
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

// slug is optional on create/update — auto-generated from the title when absent
router.post('/', requireRole('admin'), [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').isIn(['adoption', 'vaccination', 'sterilization', 'care'])
        .withMessage('Category must be adoption, vaccination, sterilization or care'),
    body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, digits and dashes'),
    body('body').optional().isString(),
    body('cover_url').optional().isURL().withMessage('cover_url must be a valid URL'),
], validate, resourcesController.postResource);

router.patch('/:id', requireRole('admin'), [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('category').optional().isIn(['adoption', 'vaccination', 'sterilization', 'care'])
        .withMessage('Category must be adoption, vaccination, sterilization or care'),
    body('slug').optional().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, digits and dashes'),
    body('body').optional().isString(),
    body('cover_url').optional().isURL().withMessage('cover_url must be a valid URL'),
], validate, resourcesController.updateResource);

router.get('/', resourcesController.getResources);

router.get('/:slug', resourcesController.getResourceById);

router.delete('/:id', requireRole('admin'), resourcesController.deleteResource);

module.exports = router;
