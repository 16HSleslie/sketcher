const mongoose = require('mongoose');
const Order = require('../../../app/models/Order');
const Product = require('../../../app/models/Product');
const { generateProductData, generateOrderData, generateCustomOrderData } = require('../helpers/test-data');

describe('Order Model', () => {
  let productId;
  
  // Create a test product to use in order tests
  beforeAll(async () => {
    const productData = generateProductData();
    const product = new Product(productData);
    const savedProduct = await product.save();
    productId = savedProduct._id;
  });
  
  it('should create a valid standard order', async () => {
    // Arrange
    const orderData = generateOrderData(productId);
    
    // Act
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // Assert
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.customer.name).toBe(orderData.customer.name);
    expect(savedOrder.total).toBe(orderData.total);
    expect(savedOrder.items.length).toBe(1);
    expect(savedOrder.isCustomOrder).toBe(false);
  });
  
  it('should create a valid custom order', async () => {
    // Arrange
    const customOrderData = generateCustomOrderData();
    customOrderData.isCustomOrder = true;
    
    // Act
    const order = new Order(customOrderData);
    const savedOrder = await order.save();
    
    // Assert
    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.customer.name).toBe(customOrderData.customer.name);
    expect(savedOrder.customOrderDetails.specifications).toBe(customOrderData.customOrderDetails.specifications);
    expect(savedOrder.isCustomOrder).toBe(true);
  });
  
  it('should have default status and paymentStatus values', async () => {
    // Arrange
    const orderData = generateOrderData(productId);
    
    // Act
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // Assert
    expect(savedOrder.status).toBe('pending');
    expect(savedOrder.paymentStatus).toBe('pending');
  });
  
  it('should fail validation with missing customer information', async () => {
    // Arrange
    const invalidOrderData = {
      items: [
        {
          product: productId,
          quantity: 1,
          price: 29.99
        }
      ],
      total: 29.99,
      paymentMethod: 'credit_card'
      // Missing customer info
    };
    
    // Act & Assert
    const invalidOrder = new Order(invalidOrderData);
    await expect(invalidOrder.save()).rejects.toThrow();
  });
  
  it('should fail validation with invalid total (negative value)', async () => {
    // Arrange
    const invalidOrderData = generateOrderData(productId, { total: -50.00 });
    
    // Act & Assert
    const invalidOrder = new Order(invalidOrderData);
    await expect(invalidOrder.save()).rejects.toThrow();
  });
}); 