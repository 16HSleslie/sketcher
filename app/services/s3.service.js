const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS with credentials from environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 service instance
const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Configure multer middleware for handling file uploads to S3
 * @param {string} folderName - The folder name within the S3 bucket
 * @returns {object} - Configured multer middleware
 */
const uploadToS3 = (folderName = 'books') => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${folderName}/${uuidv4()}${fileExtension}`;
        cb(null, fileName);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });
};

/**
 * Get a file from S3 by key
 * @param {string} key - The S3 object key
 * @returns {Promise<object>} - S3 object data
 */
const getFileFromS3 = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    const data = await s3.getObject(params).promise();
    return data;
  } catch (error) {
    throw new Error(`Failed to get file from S3: ${error.message}`);
  }
};

/**
 * Delete a file from S3 by key
 * @param {string} key - The S3 object key to delete
 * @returns {Promise<object>} - Deletion result
 */
const deleteFileFromS3 = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    const data = await s3.deleteObject(params).promise();
    return data;
  } catch (error) {
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
};

/**
 * List all files in a folder
 * @param {string} folderName - The folder name to list files from
 * @returns {Promise<Array>} - Array of file objects
 */
const listFilesInFolder = async (folderName = 'books') => {
  const params = {
    Bucket: bucketName,
    Prefix: `${folderName}/`
  };

  try {
    const data = await s3.listObjects(params).promise();
    return data.Contents;
  } catch (error) {
    throw new Error(`Failed to list files from S3: ${error.message}`);
  }
};

/**
 * Get a signed URL for temporary access to a private file
 * @param {string} key - The S3 object key
 * @param {number} expires - Expiration time in seconds (default 60)
 * @returns {string} - Signed URL
 */
const getSignedUrl = (key, expires = 60) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expires
  };

  return s3.getSignedUrl('getObject', params);
};

module.exports = {
  uploadToS3,
  getFileFromS3,
  deleteFileFromS3,
  listFilesInFolder,
  getSignedUrl
}; 