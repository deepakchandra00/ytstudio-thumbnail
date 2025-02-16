const Template = require('../models/Template');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const templateController = {
  // Create new template
  async create(req, res) {
    try {
      const templateData = {
        ...req.body,
        creator: req.user._id,
        // If no image is uploaded, use the backgroundImage from the request body
        backgroundImage: req.body.backgroundImage || (req.file ? `/uploads/${req.file.filename}` : null)
      };

      // Validate required fields
      if (!templateData.name) {
        return res.status(400).json({ error: 'Template name is required' });
      }

      if (!templateData.category) {
        return res.status(400).json({ error: 'Template category is required' });
      }

      // Ensure elements are properly formatted
      if (templateData.elements && !Array.isArray(templateData.elements)) {
        return res.status(400).json({ error: 'Elements must be an array' });
      }

      const template = new Template(templateData);
      await template.save();

      res.status(201).json(template);
    } catch (error) {
      console.error('Template Creation Error:', error);
      res.status(500).json({ error: 'Error creating template', details: error.message });
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
      const template = await Template.findByIdAndUpdate(
        req.params.id,
        { 
          ...req.body,
          // Ensure elements are properly handled
          elements: req.body.elements.map(el => ({
            ...el,
            // Convert position if needed
            position: el.position?.x ? el.position : { x: 0, y: 0 }
          }))
        },
        { new: true, runValidators: true }
      );
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Update error:', error);
      res.status(400).json({ 
        message: error.message,
        details: error.errors 
      });
    }
  },

  // Update template with full template data
  async updateFullTemplate(req, res) {
    try {
      const { id } = req.params;
      const templateData = req.body;

      // Validate required fields
      if (!templateData.name) {
        return res.status(400).json({ error: 'Template name is required' });
      }

      if (!templateData.category) {
        return res.status(400).json({ error: 'Template category is required' });
      }

      // Ensure elements are properly formatted
      if (templateData.elements && !Array.isArray(templateData.elements)) {
        return res.status(400).json({ error: 'Elements must be an array' });
      }

      // Find and update the template
      const template = await Template.findOneAndUpdate(
        { _id: id, creator: req.user._id }, 
        templateData, 
        { 
          new: true,  // Return the updated document
          runValidators: true  // Run model validation on update
        }
      );

      if (!template) {
        return res.status(404).json({ error: 'Template not found or unauthorized' });
      }

      res.json(template);
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ error: 'Error updating template', details: error.message });
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