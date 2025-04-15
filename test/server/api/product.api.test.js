const mongoose = require('mongoose');
const app = require('../../../server');
const Product = require('../../../app/models/Product');
const { getAdminToken } = require('../helpers/auth-helper');
const { createRequestHelper } = require('../helpers/request-helper');
const { generateProductData } = require('../helpers/test-data');

describe('Product API', () => {
  let api;
  let adminToken;
  let productId;
  
  // Setup test environment
  beforeAll(async () => {
    // Get admin token and create request helper
    adminToken = await getAdminToken(app);
    api = createRequestHelper(app);
  });
  
  // Test product creation
  describe('POST /api/products', () => {
    it('should create a product with valid data and admin auth', async () => {
      // Arrange
      const productData = generateProductData();
      
      // Act
      const res = await api.post('/api/products', productData, adminToken);
      
      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(productData.name);
      expect(res.body.price).toBe(productData.price);
      
      // Save product ID for later tests
      productId = res.body._id;
    });
    
    it('should reject product creation without auth token', async () => {
      // Arrange
      const productData = generateProductData({ name: 'Unauthorized Product' });
      
      // Act
      const res = await api.post('/api/products', productData);
      
      // Assert
      expect(res.status).toBe(401);
    });
    
    it('should reject product creation with invalid data', async () => {
      // Arrange
      const invalidData = { description: 'Missing required fields' };
      
      // Act
      const res = await api.post('/api/products', invalidData, adminToken);
      
      // Assert
      expect(res.status).toBe(400);
    });
  });
  
  // Test product retrieval
  describe('GET /api/products', () => {
    it('should retrieve all products', async () => {
      // Act
      const res = await api.get('/api/products');
      
      // Assert
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  
  // Test getting a specific product
  describe('GET /api/products/:id', () => {
    it('should get a specific product by ID', async () => {
      // Act
      const res = await api.get(`/api/products/${productId}`);
      
      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', productId);
    });
    
    it('should return 404 for non-existent product ID', async () => {
      // Arrange - Generate a valid but non-existent object ID
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Act
      const res = await api.get(`/api/products/${nonExistentId}`);
      
      // Assert
      expect(res.status).toBe(404);
    });
  });
  
  // Test product update
  describe('PUT /api/products/:id', () => {
    it('should update a product with admin auth', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Product Name',
        price: 49.99
      };
      
      // Act
      const res = await api.put(`/api/products/${productId}`, updateData, adminToken);
      
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.price).toBe(updateData.price);
    });
    
    it('should reject updates without auth token', async () => {
      // Arrange
      const updateData = { name: 'Unauthorized Update' };
      
      // Act
      const res = await api.put(`/api/products/${productId}`, updateData);
      
      // Assert
      expect(res.status).toBe(401);
    });
  });
  
  // Test product deletion
  describe('DELETE /api/products/:id', () => {
    it('should reject deletion without auth token', async () => {
      // Act
      const res = await api.delete(`/api/products/${productId}`);
      
      // Assert
      expect(res.status).toBe(401);
    });
    
    it('should delete a product with admin auth', async () => {
      // Act
      const res = await api.delete(`/api/products/${productId}`, adminToken);
      
      // Assert
      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('Product removed');
      
      // Verify product is deleted
      const checkRes = await api.get(`/api/products/${productId}`);
      expect(checkRes.status).toBe(404);
    });
  });
}); 