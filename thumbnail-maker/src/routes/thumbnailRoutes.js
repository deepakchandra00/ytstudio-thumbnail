const express = require('express');
const thumbnailController = require('../controllers/thumbnailController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const router = express.Router();

/**
 * @swagger
 * /api/thumbnails:
 *   post:
 *     tags: [Thumbnails]
 *     summary: Create a new thumbnail
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  auth, 
  upload.single('image'), 
  thumbnailController.create
);

/**
 * @swagger
 * /api/thumbnails:
 *   get:
 *     tags: [Thumbnails]
 *     summary: Get all thumbnails for user
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, thumbnailController.getAll);

/**
 * @swagger
 * /api/thumbnails/{id}:
 *   get:
 *     tags: [Thumbnails]
 *     summary: Get thumbnail by ID
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth, thumbnailController.getById);

/**
 * @swagger
 * /api/thumbnails/suggestions:
 *   post:
 *     tags: [Thumbnails]
 *     summary: Generate AI suggestions for thumbnail text
 *     security:
 *       - bearerAuth: []
 */
router.post('/suggestions', 
  auth, 
  thumbnailController.generateSuggestions
);

/**
 * @swagger
 * /api/thumbnails/{id}:
 *   delete:
 *     tags: [Thumbnails]
 *     summary: Delete thumbnail
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, thumbnailController.delete);

module.exports = router; 