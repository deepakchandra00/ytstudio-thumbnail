require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS with environment variables
const s3 = new AWS.S3({
  region: process.env.AWS_S3_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
console.log('ALL Environment Variables:', Object.keys(process.env));

console.log('AWS Config:', {
  region: process.env.AWS_S3_REGION || 'MISSING',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'PRESENT' : 'MISSING',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'PRESENT' : 'MISSING'
});
router.get('/', async (req, res) => {
  const { folder, limit = 10, token } = req.query;
  const allStickers = [];

  try {
    if (!folder) {
      return res.status(400).send({ error: 'Folder parameter is required' });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'youtubetests',
      Prefix: `${folder}/`,
      MaxKeys: parseInt(limit, 10),
      ContinuationToken: token || undefined, // Handle pagination
    };

    const data = await s3.listObjectsV2(params).promise();

    const imageUrls = data.Contents.map((item) => ({
      key: item.Key,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
    }));

    res.send({
      images: imageUrls,
      nextToken: data.NextContinuationToken || null, // Return next token
      isTruncated: data.IsTruncated, // Indicate if more data is available
    });
  } catch (error) {
    return res.status(error.statusCode || 500).send(error);
  }
});

// New route to get font-images from AWS S3
router.get('/font-images', (req, res) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME || 'youtubetests', 
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
      Bucket: process.env.AWS_BUCKET_NAME || 'youtubetests', 
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