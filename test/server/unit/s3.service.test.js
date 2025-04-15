const { S3Client, GetObjectCommand, DeleteObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { uploadToS3, getFileFromS3, deleteFileFromS3, listFilesInFolder, createSignedUrl } = require('../../../app/services/s3.service');

// Mock AWS S3 Client
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn();
  return {
    S3Client: jest.fn(() => ({
      send: mockSend
    })),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    ListObjectsCommand: jest.fn()
  };
});

// Mock S3 Request Presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn()
}));

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
  let s3Client;
  
  beforeEach(() => {
    // Get the mocked S3 client
    s3Client = new S3Client();
    
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
      
      s3Client.send.mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await getFileFromS3('test-key');
      
      // Check S3 was called with correct parameters
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key'
      });
      
      // Verify the result
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error when S3 getObject fails', async () => {
      // Mock error response
      s3Client.send.mockRejectedValue(new Error('S3 error'));
      
      // Call the function and expect it to throw
      await expect(getFileFromS3('test-key')).rejects.toThrow('Failed to get file from S3: S3 error');
    });
  });
  
  describe('deleteFileFromS3', () => {
    it('should delete a file from S3 successfully', async () => {
      // Mock successful response
      s3Client.send.mockResolvedValue({ DeleteMarker: true });
      
      // Call the function
      const result = await deleteFileFromS3('test-key');
      
      // Check S3 was called with correct parameters
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key'
      });
      
      // Verify the result
      expect(result).toEqual({ DeleteMarker: true });
    });
    
    it('should throw an error when S3 deleteObject fails', async () => {
      // Mock error response
      s3Client.send.mockRejectedValue(new Error('S3 error'));
      
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
      
      s3Client.send.mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await listFilesInFolder('books');
      
      // Check S3 was called with correct parameters
      expect(ListObjectsCommand).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: 'books/'
      });
      
      // Verify the result
      expect(result).toEqual(mockResponse.Contents);
    });
    
    it('should throw an error when S3 listObjects fails', async () => {
      // Mock error response
      s3Client.send.mockRejectedValue(new Error('S3 error'));
      
      // Call the function and expect it to throw
      await expect(listFilesInFolder('books')).rejects.toThrow('Failed to list files from S3: S3 error');
    });
  });
  
  describe('createSignedUrl', () => {
    it('should return a signed URL', async () => {
      // Mock the getSignedUrl method
      getSignedUrl.mockResolvedValue('https://example-signed-url.com');
      
      // Call the function
      const result = await createSignedUrl('test-key', 120);
      
      // Check GetObjectCommand was called with correct parameters
      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'test-key'
      });
      
      // Verify the result
      expect(result).toBe('https://example-signed-url.com');
    });
    
    it('should throw an error when generating signed URL fails', async () => {
      // Mock error response
      getSignedUrl.mockRejectedValue(new Error('URL generation error'));
      
      // Call the function and expect it to throw
      await expect(createSignedUrl('test-key')).rejects.toThrow('Failed to generate signed URL: URL generation error');
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