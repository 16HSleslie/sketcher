const mongoose = require('mongoose');
const app = require('../../../server');
const { getAdminToken } = require('../helpers/auth-helper');
const { createRequestHelper } = require('../helpers/request-helper');
const { generateProductData, generateOrderData } = require('../helpers/test-data');

describe('Order Flow Integration', () => {
  let api;
  let adminToken;
  let productId;
  let orderId;
  
  // Setup test environment
  beforeAll(async () => {
    // Get admin token and create request helper
    adminToken = await getAdminToken(app);
    api = createRequestHelper(app);
  });
  
  // Test complete order flow
  it('should handle complete order flow from product creation to order fulfillment', async () => {
    // Step 1: Create a product as admin
    const productData = generateProductData();
    const productRes = await api.post('/api/products', productData, adminToken);
    
    expect(productRes.status).toBe(200);
    productId = productRes.body._id;
    
    // Step 2: Customer creates an order with the product
    const orderData = generateOrderData(productId);
    const orderRes = await api.post('/api/orders', orderData);
    
    expect(orderRes.status).toBe(200);
    orderId = orderRes.body._id;
    
    // Step 3: Admin views the order
    const viewOrderRes = await api.get(`/api/orders/${orderId}`, adminToken);
    
    expect(viewOrderRes.status).toBe(200);
    expect(viewOrderRes.body.items[0].product).toBe(productId);
    
    // Step 4: Admin updates the order status to processing
    const updateRes1 = await api.put(`/api/orders/${orderId}`, {
      status: 'processing',
      paymentStatus: 'completed'
    }, adminToken);
    
    expect(updateRes1.status).toBe(200);
    expect(updateRes1.body.status).toBe('processing');
    expect(updateRes1.body.paymentStatus).toBe('completed');
    
    // Step 5: Admin updates order status to shipped
    const updateRes2 = await api.put(`/api/orders/${orderId}`, {
      status: 'shipped',
      trackingNumber: 'TRACK123456789'
    }, adminToken);
    
    expect(updateRes2.status).toBe(200);
    expect(updateRes2.body.status).toBe('shipped');
    expect(updateRes2.body.trackingNumber).toBe('TRACK123456789');
    
    // Step 6: Admin updates stock of the product
    const updateProductRes = await api.put(`/api/products/${productId}`, {
      stock: productData.stock - orderData.items[0].quantity
    }, adminToken);
    
    expect(updateProductRes.status).toBe(200);
    expect(updateProductRes.body.stock).toBe(productData.stock - orderData.items[0].quantity);
    
    // Step 7: Admin marks order as completed
    const updateRes3 = await api.put(`/api/orders/${orderId}`, {
      status: 'completed'
    }, adminToken);
    
    expect(updateRes3.status).toBe(200);
    expect(updateRes3.body.status).toBe('completed');
  });
}); 