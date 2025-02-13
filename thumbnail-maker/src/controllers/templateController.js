const Template = require('../models/Template');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const templateController = {
  // Create new template
  async create(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Please upload an image' });
      }

      const templateData = {
        ...req.body,
        creator: req.user._id,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
      };

      const template = new Template(templateData);
      await template.save();

      res.status(201).json(template);
    } catch (error) {
      console.error('Template Creation Error:', error);
      res.status(500).json({ error: 'Error creating template' });
    }
  },

  // Get all templates (with filtering)
  async getAll(req, res) {
    try {
      const { category, isPublic } = req.query;
      const query = {};

      if (category) query.category = category;
      if (isPublic) query.isPublic = isPublic === 'true';

      const templates = await Template.find(query)
        .populate('creator', 'name email')
        .sort('-createdAt');

      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching templates' });
    }
  },

  // Get template by ID
  async getById(req, res) {
    try {
      const template = await Template.findById(req.params.id)
        .populate('creator', 'name email');

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching template' });
    }
  },

  // Update template
  async update(req, res) {
    try {
      const updates = req.body;
      
      if (req.file) {
        updates.imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      }

      const template = await Template.findOneAndUpdate(
        { _id: req.params.id, creator: req.user._id },
        updates,
        { new: true }
      );

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Error updating template' });
    }
  },

  // Delete template
  async delete(req, res) {
    try {
      const template = await Template.findById(req.params.id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Delete local file if it exists
      if (template.imageUrl) {
        const filePath = path.join(__dirname, '../../public/uploads', template.imageUrl.split('/').pop());
        try {
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete local file:', fileError);
        }
      }

      await Template.findByIdAndDelete(req.params.id);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting template' });
    }
  }
};

module.exports = templateController; 