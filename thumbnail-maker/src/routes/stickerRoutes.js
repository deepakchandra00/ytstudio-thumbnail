const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS with environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

router.get('/', async (req, res) => {
  const { folder } = req.query; // Get the folder from query parameters
  const limit = 10;
  const allStickers = [];

  try {
    if (!folder) {
      return res.status(400).send({ error: 'Folder parameter is required' });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'youtube-thumbnail',
      Prefix: `${folder}/`,
      MaxKeys: limit
    };

    const data = await s3.listObjectsV2(params).promise();
    allStickers.push(...data.Contents);

    res.send(allStickers);
  } catch (error) {
    return res.status(error.statusCode).send(error);
  }
});

// New route to get font-images from AWS S3
router.get('/font-images', (req, res) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || 'youtube-thumbnail', 
        Prefix: 'font-images/', 
    };

    s3.listObjectsV2(params, (err, data) => {
        if (err) {
            return res.status(err.statusCode).send(err);
        }
        const imageUrls = data.Contents.map(item => item.Key);
        res.send(imageUrls); 
    });
});

// New route to get background-images from AWS S3
router.get('/background', (req, res) => {
  const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'youtube-thumbnail', 
      Prefix: 'background/', 
  };

  s3.listObjectsV2(params, (err, data) => {
      if (err) {
          return res.status(err.statusCode).send(err);
      }
      const imageUrls = data.Contents.map(item => item.Key);
      res.send(imageUrls); 
  });
});

module.exports = router; 