const AWS = require('aws-sdk');
const { uploadToS3, getFileFromS3, deleteFileFromS3, listFilesInFolder, getSignedUrl } = require('../../../app/services/s3.service');

// Mock AWS S3
jest.mock('aws-sdk', () => {
  const mockS3Instance = {
    getObject: jest.fn().mockReturnThis(),
    deleteObject: jest.fn().mockReturnThis(),
    listObjects: jest.fn().mockReturnThis(),
    getSignedUrl: jest.fn(),
    promise: jest.fn()
  };
  
  return {
    S3: jest.fn(() => mockS3Instance),
    config: {
      update: jest.fn()
    }
  };
});

// Mock multer and multer-s3
jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => ({
    single: jest.fn()
  }));
});

jest.mock('multer-s3', () => {
  return jest.fn();
});

describe('S3 Service', () => {
  let s3Instance;
  
  beforeEach(() => {
    // Get the mocked S3 instance
    s3Instance = new AWS.S3();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('getFileFromS3', () => {
    it('should get a file from S3 successfully', async () => {
      // Mock successful response
      const mockResponse = {
        Body: Buffer.from('test file content'),
        ContentType: 'image/jpeg',
        ContentLength: 1024
      };
      
      s3Instance.promise.mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await getFileFromS3('test-key');
      
      // Check S3 was called with correct parameters
      expect(s3Instance.getObject).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key'
      });
      
      // Verify the result
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error when S3 getObject fails', async () => {
      // Mock error response
      s3Instance.promise.mockRejectedValue(new Error('S3 error'));
      
      // Call the function and expect it to throw
      await expect(getFileFromS3('test-key')).rejects.toThrow('Failed to get file from S3: S3 error');
    });
  });
  
  describe('deleteFileFromS3', () => {
    it('should delete a file from S3 successfully', async () => {
      // Mock successful response
      s3Instance.promise.mockResolvedValue({ DeleteMarker: true });
      
      // Call the function
      const result = await deleteFileFromS3('test-key');
      
      // Check S3 was called with correct parameters
      expect(s3Instance.deleteObject).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key'
      });
      
      // Verify the result
      expect(result).toEqual({ DeleteMarker: true });
    });
    
    it('should throw an error when S3 deleteObject fails', async () => {
      // Mock error response
      s3Instance.promise.mockRejectedValue(new Error('S3 error'));
      
      // Call the function and expect it to throw
      await expect(deleteFileFromS3('test-key')).rejects.toThrow('Failed to delete file from S3: S3 error');
    });
  });
  
  describe('listFilesInFolder', () => {
    it('should list files in a folder successfully', async () => {
      // Mock successful response
      const mockResponse = {
        Contents: [
          { Key: 'books/file1.jpg', Size: 1024 },
          { Key: 'books/file2.png', Size: 2048 }
        ]
      };
      
      s3Instance.promise.mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await listFilesInFolder('books');
      
      // Check S3 was called with correct parameters
      expect(s3Instance.listObjects).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: 'books/'
      });
      
      // Verify the result
      expect(result).toEqual(mockResponse.Contents);
    });
    
    it('should throw an error when S3 listObjects fails', async () => {
      // Mock error response
      s3Instance.promise.mockRejectedValue(new Error('S3 error'));
      
      // Call the function and expect it to throw
      await expect(listFilesInFolder('books')).rejects.toThrow('Failed to list files from S3: S3 error');
    });
  });
  
  describe('getSignedUrl', () => {
    it('should return a signed URL', () => {
      // Mock the getSignedUrl method
      s3Instance.getSignedUrl.mockReturnValue('https://example-signed-url.com');
      
      // Call the function
      const result = getSignedUrl('test-key', 120);
      
      // Check S3 was called with correct parameters
      expect(s3Instance.getSignedUrl).toHaveBeenCalledWith('getObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key',
        Expires: 120
      });
      
      // Verify the result
      expect(result).toBe('https://example-signed-url.com');
    });
  });
  
  describe('uploadToS3', () => {
    it('should return a multer middleware', () => {
      // Call the function
      const middleware = uploadToS3('test-folder');
      
      // Verify multer was called
      expect(require('multer')).toHaveBeenCalled();
      
      // Verify the middleware has the expected methods
      expect(middleware.single).toBeDefined();
    });
  });
}); 