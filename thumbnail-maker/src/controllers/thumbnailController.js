const Thumbnail = require('../models/Thumbnail');
const Template = require('../models/Template');
const deepseekService = require('../services/deepseekService');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const thumbnailController = {
  // Create new thumbnail
  async create(req, res) {
    try {
      const { templateId, title, textLayers, videoDescription } = req.body;

      // Verify template exists
      const template = await Template.findById(templateId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Generate AI suggestions if video title is provided
      let aiSuggestions = [];
      if (title && videoDescription) {
        aiSuggestions = await deepseekService.generateThumbnailSuggestions(
          title,
          videoDescription
        );
      }

      const thumbnail = new Thumbnail({
        title,
        baseTemplate: templateId,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        textLayers,
        creator: req.user._id,
        aiSuggestions
      });

      await thumbnail.save();
      res.status(201).json(thumbnail);
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      res.status(500).json({ error: 'Error creating thumbnail' });
    }
  },

  // Get all thumbnails for user
  async getAll(req, res) {
    try {
      const thumbnails = await Thumbnail.find({ creator: req.user._id })
        .populate('baseTemplate')
        .sort('-createdAt');

      res.json(thumbnails);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching thumbnails' });
    }
  },

  // Get thumbnail by ID
  async getById(req, res) {
    try {
      const thumbnail = await Thumbnail.findOne({
        _id: req.params.id,
        creator: req.user._id
      }).populate('baseTemplate');

      if (!thumbnail) {
        return res.status(404).json({ error: 'Thumbnail not found' });
      }

      res.json(thumbnail);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching thumbnail' });
    }
  },

  // Generate AI suggestions
  async generateSuggestions(req, res) {
    try {
      const { title, description } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ 
          error: 'Both title and description are required' 
        });
      }

      const suggestions = await deepseekService.generateThumbnailSuggestions(
        title,
        description
      );

      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: 'Error generating suggestions' });
    }
  },

  // Delete thumbnail
  async delete(req, res) {
    try {
      const thumbnail = await Thumbnail.findOneAndDelete({
        _id: req.params.id,
        creator: req.user._id
      });

      if (!thumbnail) {
        return res.status(404).json({ error: 'Thumbnail not found' });
      }

      // Delete local file if it exists
      if (thumbnail.imageUrl) {
        const filePath = path.join(__dirname, '../../public/uploads', thumbnail.imageUrl.split('/').pop());
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete local file:', fileError);
        }
      }

      res.json({ message: 'Thumbnail deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting thumbnail' });
    }
  }
};

module.exports = thumbnailController; 