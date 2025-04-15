const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Product = require('../../app/models/Product');

let adminToken;
let productId;


// Cleanup is now handled by the global setup in jest.setup.js
// No need for manual connection closing

// Product tests
describe('Product API', () => {
  describe('POST /api/products', () => {
    it('should create a new product with admin auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          price: 29.99,
          category: 'Books',
          stock: 10,
          images: ['test-image.jpg']
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual('Test Product');
      
      // Save product ID for future tests
      productId = res.body._id;
    });
    
    it('should reject product creation without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Unauthorized Product',
          description: 'This should not be created',
          price: 19.99,
          category: 'Electronics',
          stock: 5
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });
  
  describe('GET /api/products', () => {
    it('should retrieve all products', async () => {
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/products/:id', () => {
    it('should retrieve a specific product by ID', async () => {
      const res = await request(app).get(`/api/products/${productId}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', productId);
      expect(res.body.name).toEqual('Test Product');
    });
    
    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/123456789012345678901234');
      
      expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('PUT /api/products/:id', () => {
    it('should update a product with admin auth', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('x-auth-token', adminToken)
        .send({
          name: 'Updated Product',
          price: 39.99
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated Product');
      expect(res.body.price).toEqual(39.99);
      expect(res.body.description).toEqual('This is a test product'); // Unchanged field
    });
    
    it('should reject updates without auth', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({
          name: 'Unauthorized Update'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });
  
  describe('DELETE /api/products/:id', () => {
    it('should reject deletion without auth', async () => {
      const res = await request(app).delete(`/api/products/${productId}`);
      
      expect(res.statusCode).toEqual(401);
    });
    
    it('should delete a product with admin auth', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Product removed');
      
      // Verify product is deleted
      const checkRes = await request(app).get(`/api/products/${productId}`);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
}); 