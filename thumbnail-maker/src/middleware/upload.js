const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Helper function to upload to S3
const uploadToS3 = async (file) => {
  try {
    // Process image with sharp
    const processedImage = await sharp(file.buffer)
      .resize(1280, 720, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const fileName = `thumbnails/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: processedImage,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return {
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Error uploading to S3');
  }
};

// Helper function to delete from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('Error deleting from S3');
  }
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3
};