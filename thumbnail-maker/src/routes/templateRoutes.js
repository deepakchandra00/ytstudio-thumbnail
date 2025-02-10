const express = require('express');
const templateController = require('../controllers/templateController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();

/**
 * @swagger
 * /api/templates:
 *   post:
 *     tags: [Templates]
 *     summary: Create a new template
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, upload.single('image'), templateController.create);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     tags: [Templates]
 *     summary: Get all templates
 */
router.get('/', templateController.getAll);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     tags: [Templates]
 *     summary: Get template by ID
 */
router.get('/:id', templateController.getById);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     tags: [Templates]
 *     summary: Update template
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, upload.single('image'), templateController.update);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     tags: [Templates]
 *     summary: Delete template
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, templateController.delete);

module.exports = router; 