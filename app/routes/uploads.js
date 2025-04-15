const express = require('express');
const router = express.Router();
const { uploadToS3, getFileFromS3, deleteFileFromS3, listFilesInFolder, getSignedUrl } = require('../services/s3.service');
const auth = require('../middlewares/auth');

/**
 * @route POST /api/uploads
 * @desc Upload a file to S3
 * @access Private
 */
router.post('/', auth, uploadToS3().single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file info
    res.status(201).json({
      success: true,
      file: {
        key: req.file.key,
        location: req.file.location,
        etag: req.file.etag,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
});

/**
 * @route POST /api/uploads/book-cover
 * @desc Upload a book cover image
 * @access Private
 */
router.post('/book-cover', auth, uploadToS3('book-covers').single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No cover image uploaded' });
    }

    // Return the file info
    res.status(201).json({
      success: true,
      file: {
        key: req.file.key,
        location: req.file.location,
        etag: req.file.etag,
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({ message: 'Server error during cover upload', error: error.message });
  }
});

/**
 * @route GET /api/uploads/:key
 * @desc Get a file by key
 * @access Private
 */
router.get('/:key', auth, async (req, res) => {
  try {
    const key = req.params.key;
    const file = await getFileFromS3(key);
    
    // Set appropriate headers
    res.set({
      'Content-Type': file.ContentType,
      'Content-Length': file.ContentLength
    });
    
    // Send the file
    res.send(file.Body);
  } catch (error) {
    console.error('Get file error:', error);
    res.status(404).json({ message: 'File not found or error retrieving file', error: error.message });
  }
});

/**
 * @route GET /api/uploads/signed/:key
 * @desc Get a signed URL for a file
 * @access Private
 */
router.get('/signed/:key', auth, (req, res) => {
  try {
    const key = req.params.key;
    const expires = req.query.expires ? parseInt(req.query.expires) : 60;
    const url = getSignedUrl(key, expires);
    
    res.json({ url });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ message: 'Error generating signed URL', error: error.message });
  }
});

/**
 * @route GET /api/uploads/list/:folder
 * @desc List all files in a folder
 * @access Private
 */
router.get('/list/:folder', auth, async (req, res) => {
  try {
    const folder = req.params.folder;
    const files = await listFilesInFolder(folder);
    
    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Error listing files', error: error.message });
  }
});

/**
 * @route DELETE /api/uploads/:key
 * @desc Delete a file from S3
 * @access Private
 */
router.delete('/:key', auth, async (req, res) => {
  try {
    const key = req.params.key;
    await deleteFileFromS3(key);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

module.exports = router; 