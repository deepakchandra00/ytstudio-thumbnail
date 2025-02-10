const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'text'],
    required: true
  },
  url: String, // Optional, only for image type
  content: String, // Optional, only for text type
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: Number,
    height: Number
  },
  opacity: {
    type: Number,
    default: 1
  },
  rotation: {
    type: Number,
    default: 0
  },
  style: {
    fontFamily: String,
    fontSize: Number,
    color: String,
    bold: Boolean,
    shadow: {
      color: String,
      blur: Number,
      offsetX: Number,
      offsetY: Number
    }
  }
});

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  thumbnail: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageKey: {
    type: String,
    required: true
  },
  canvasSize: {
    width: { type: Number, required: true, default: 1280 },
    height: { type: Number, required: true, default: 720 }
  },
  background: {
    type: {
      type: String,
      enum: ['image', 'gradient', 'color'],
      required: true
    },
    url: String,
    colors: [String]
  },
  elements: [elementSchema],
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