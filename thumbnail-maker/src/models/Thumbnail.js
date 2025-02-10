const mongoose = require('mongoose');

const thumbnailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  baseTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  textLayers: [{
    x: Number,
    y: Number,
    fontSize: Number,
    fontFamily: String,
    color: String,
    text: String
  }],
  imageLayers: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    imageUrl: String
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiSuggestions: [{
    text: String,
    score: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

thumbnailSchema.index({ creator: 1, createdAt: -1 });

module.exports = mongoose.model('Thumbnail', thumbnailSchema); 