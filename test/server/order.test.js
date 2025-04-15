const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Order = require('../../app/models/Order');
const Product = require('../../app/models/Product');
const Admin = require('../../app/models/Admin');
const { getAdminToken } = require('./helpers/auth-helper');
const { generateProductData } = require('./helpers/test-data');

let adminToken;
let productId;
let orderId;

// Setup before tests
beforeAll(async () => {
  // Get admin token first
  adminToken = await getAdminToken(app);
  
  // Create a test product
  const productData = generateProductData({
    name: 'Test Product',
    description: 'This is a test product for orders',
    price: 49.99,
    category: 'Test Category', 
    stock: 20,
    images: ['test-image.jpg']
  });
  
  const productRes = await request(app)
    .post('/api/products')
    .set('x-auth-token', adminToken)
    .send(productData);
  
  if (productRes.statusCode === 200) {
    productId = productRes.body._id;
    console.log('Created test product for orders with ID:', productId);
  }
});

// Cleanup is now handled by the global setup in jest.setup.js
// No need for manual connection closing

// Order tests
describe('Order API', () => {
  describe('POST /api/orders', () => {
    it('should create a new standard order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer: {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '123-456-7890',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'TS',
              zipCode: '12345',
              country: 'Test Country'
            }
          },
          items: [
            {
              product: productId,
              quantity: 2,
              price: 49.99
            }
          ],
          total: 99.98,
          paymentMethod: 'credit_card'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.customer.name).toEqual('Test Customer');
      expect(res.body.total).toEqual(99.98);
      
      // Save order ID for future tests
      orderId = res.body._id;
      console.log('Created test order with ID:', orderId);
    });
    
    it('should create a new custom order', async () => {
      const res = await request(app)
        .post('/api/orders/custom')
        .send({
          customer: {
            name: 'Custom Customer',
            email: 'custom@example.com',
            phone: '987-654-3210'
          },
          customOrderDetails: {
            specifications: 'Custom leather-bound book with gold leaf design',
            requiredMaterials: 'Premium leather, gold leaf',
            estimatedCompletionTime: '2 weeks',
            additionalNotes: 'Customer wants their name embossed on the spine'
          },
          total: 299.99,
          paymentMethod: 'paypal'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.customer.name).toEqual('Custom Customer');
      expect(res.body.isCustomOrder).toBe(true);
      expect(res.body.customOrderDetails.specifications).toEqual('Custom leather-bound book with gold leaf design');
    });
  });
  
  describe('GET /api/orders', () => {
    it('should reject orders list without auth', async () => {
      const res = await request(app).get('/api/orders');
      
      expect(res.statusCode).toEqual(401);
    });
    
    it('should retrieve all orders with admin auth', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/orders/:id', () => {
    it('should reject order details without auth', async () => {
      const res = await request(app).get(`/api/orders/${orderId}`);
      
      expect(res.statusCode).toEqual(401);
    });
    
    it('should retrieve a specific order by ID with admin auth', async () => {
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', orderId);
      expect(res.body.customer.name).toEqual('Test Customer');
    });
  });
  
  describe('PUT /api/orders/:id', () => {
    it('should update order status with admin auth', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('x-auth-token', adminToken)
        .send({
          status: 'processing',
          paymentStatus: 'completed'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('processing');
      expect(res.body.paymentStatus).toEqual('completed');
    });
    
    it('should reject updates without auth', async () => {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({
          status: 'shipped'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });
  
  describe('DELETE /api/orders/:id', () => {
    it('should reject deletion without auth', async () => {
      const res = await request(app).delete(`/api/orders/${orderId}`);
      
      expect(res.statusCode).toEqual(401);
    });
    
    it('should delete an order with admin auth', async () => {
      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('x-auth-token', adminToken);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Order removed');
      
      // Verify order is deleted
      const checkRes = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('x-auth-token', adminToken);
      expect(checkRes.statusCode).toEqual(404);
    });
  });
}); 