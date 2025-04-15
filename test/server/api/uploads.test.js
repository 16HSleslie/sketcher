const request = require('supertest');
const app = require('../../../server');
const jwt = require('jsonwebtoken');
const config = require('../../../config');

// Mock the S3 service
jest.mock('../../../app/services/s3.service', () => ({
  uploadToS3: jest.fn().mockReturnValue({
    single: jest.fn().mockImplementation((fieldname) => {
      return (req, res, next) => {
        // Mock file data based on the fieldname
        req.file = {
          key: `test-folder/${fieldname}-123.jpg`,
          location: `https://s3.amazonaws.com/test-bucket/test-folder/${fieldname}-123.jpg`,
          etag: 'test-etag',
          size: 1024,
          mimetype: 'image/jpeg',
          originalname: 'test-image.jpg'
        };
        next();
      };
    })
  }),
  getFileFromS3: jest.fn().mockImplementation((key) => {
    return Promise.resolve({
      Body: Buffer.from('test file content'),
      ContentType: 'image/jpeg',
      ContentLength: 1024
    });
  }),
  deleteFileFromS3: jest.fn().mockResolvedValue({ DeleteMarker: true }),
  listFilesInFolder: jest.fn().mockResolvedValue([
    { Key: 'books/file1.jpg', Size: 1024 },
    { Key: 'books/file2.png', Size: 2048 }
  ]),
  getSignedUrl: jest.fn().mockReturnValue('https://example-signed-url.com')
}));

describe('Upload Routes', () => {
  let token;
  
  beforeEach(() => {
    // Create a test token for authentication
    token = jwt.sign(
      { user: { id: 'test-user-id' } },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  describe('POST /api/uploads', () => {
    it('should upload a file successfully', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .set('x-auth-token', token)
        .field('name', 'Test File')
        .attach('image', Buffer.from('test file content'), 'test-image.jpg');
      
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.key).toBeDefined();
      expect(response.body.file.location).toBeDefined();
    });
    
    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/uploads')
        .field('name', 'Test File')
        .attach('image', Buffer.from('test file content'), 'test-image.jpg');
      
      expect(response.statusCode).toBe(401);
    });
  });
  
  describe('POST /api/uploads/book-cover', () => {
    it('should upload a book cover successfully', async () => {
      const response = await request(app)
        .post('/api/uploads/book-cover')
        .set('x-auth-token', token)
        .field('name', 'Test Cover')
        .attach('cover', Buffer.from('test file content'), 'test-cover.jpg');
      
      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.file).toBeDefined();
      expect(response.body.file.key).toBeDefined();
      expect(response.body.file.location).toBeDefined();
    });
  });
  
  describe('GET /api/uploads/:key', () => {
    it('should get a file by key', async () => {
      const response = await request(app)
        .get('/api/uploads/test-key')
        .set('x-auth-token', token);
      
      expect(response.statusCode).toBe(200);
      expect(response.header['content-type']).toBe('image/jpeg');
      expect(response.header['content-length']).toBe('17');
    });
  });
  
  describe('GET /api/uploads/signed/:key', () => {
    it('should get a signed URL for a file', async () => {
      const response = await request(app)
        .get('/api/uploads/signed/test-key')
        .set('x-auth-token', token);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.url).toBe('https://example-signed-url.com');
    });
  });
  
  describe('GET /api/uploads/list/:folder', () => {
    it('should list all files in a folder', async () => {
      const response = await request(app)
        .get('/api/uploads/list/books')
        .set('x-auth-token', token);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.files).toBeInstanceOf(Array);
      expect(response.body.files).toHaveLength(2);
    });
  });
  
  describe('DELETE /api/uploads/:key', () => {
    it('should delete a file from S3', async () => {
      const response = await request(app)
        .delete('/api/uploads/test-key')
        .set('x-auth-token', token);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('File deleted successfully');
    });
  });
}); 