const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesControllers');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', resourcesController.getResources);

router.get('/:slug', resourcesController.getResourceById);

router.post('/', authMiddleware, [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
], resourcesController.postResource);

router.patch('/:id', authMiddleware, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('slug').optional().notEmpty().withMessage('Slug cannot be empty'),
], resourcesController.updateResource);

router.delete('/:id', authMiddleware, resourcesController.deleteResource);

module.exports = router;