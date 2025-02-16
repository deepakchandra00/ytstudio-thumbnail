const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'text'],
    required: true
  },
  uri: {
    type: String,
    required: function() { return this.type === 'image'; },
  },
  content: String, // For text elements
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  font: {
    type: String,
    default: 'serif'
  },
  size: {
    type: Number,
    default: 24
  },
  color: {
    type: String,
    default: '#000000'
  },
  fontStyle: {
    type: String,
    enum: ['normal', 'italic', 'bold', 'bold-italic'],
    default: 'normal'
  },
  alignment: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'left'
  },
  zIndex: {
    type: Number,
    default: 0
  },
  opacity: {
    type: Number,
    default: 1
  },
  rotation: {
    type: Number,
    default: 0
  },
  id: {
    type: String,
    required: true
  }
});

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  elements: [elementSchema],
  backgroundImage: {
    type: String
  },
  thumbnail: {
    type: String
  },
  canvasSize: {
    width: { type: Number, default: 1280 },
    height: { type: Number, default: 720 }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
templateSchema.index({ category: 1, isPublic: 1 });
templateSchema.index({ creator: 1 });

module.exports = mongoose.model('Template', templateSchema); 