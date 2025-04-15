const mongoose = require('mongoose');
const Product = require('../../../app/models/Product');
const { generateProductData } = require('../helpers/test-data');

describe('Product Model', () => {
  it('should create a valid product', async () => {
    // Arrange
    const productData = generateProductData();
    
    // Act
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    // Assert
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(productData.name);
    expect(savedProduct.price).toBe(productData.price);
    expect(savedProduct.description).toBe(productData.description);
  });
  
  it('should fail validation with missing required fields', async () => {
    // Arrange
    const invalidProduct = new Product({
      // Missing required fields
      description: 'Invalid product without name or price'
    });
    
    // Act & Assert
    await expect(invalidProduct.save()).rejects.toThrow();
  });
  
  it('should fail validation with negative price', async () => {
    // Arrange
    const invalidProductData = generateProductData({ price: -10 });
    const invalidProduct = new Product(invalidProductData);
    
    // Act & Assert
    await expect(invalidProduct.save()).rejects.toThrow();
  });
  
  it('should fail validation with zero stock', async () => {
    // Arrange
    const invalidProductData = generateProductData({ stock: -5 });
    const invalidProduct = new Product(invalidProductData);
    
    // Act & Assert
    await expect(invalidProduct.save()).rejects.toThrow();
  });
}); 