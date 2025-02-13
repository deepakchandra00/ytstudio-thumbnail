const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Configure AWS with environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

router.get('/', async (req, res) => {
  try {
    console.log('Received sticker list request');
    
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'youtube-thumbnail',
      Prefix: 'element/'
    };

    console.log('Fetching stickers from S3 bucket:', params.Bucket);
    const data = await s3.listObjectsV2(params).promise();
    
    const stickers = data.Contents
      ? data.Contents
          .map(item => item.Key.replace('element/', ''))
          .filter(key => key.match(/\.(png|jpg|jpeg|gif)$/i))
      : [];

    console.log(`Successfully retrieved ${stickers.length} stickers`);
    res.json(stickers);
  } catch (error) {
    console.error('Error listing stickers:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch stickers',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

module.exports = router; 