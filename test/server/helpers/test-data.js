/**
 * Test data factory to generate consistent test data
 */

// Generate product data
function generateProductData(overrides = {}) {
  return {
    name: 'Test Product',
    description: 'This is a test product for testing purposes',
    price: 29.99,
    category: 'Test Category',
    stock: 10,
    images: ['test-image.jpg'],
    ...overrides
  };
}

// Generate order data
function generateOrderData(productId, overrides = {}) {
  return {
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
        price: 29.99
      }
    ],
    total: 59.98,
    paymentMethod: 'credit_card',
    ...overrides
  };
}

// Generate custom order data
function generateCustomOrderData(overrides = {}) {
  return {
    customer: {
      name: 'Custom Customer',
      email: 'custom@example.com',
      phone: '987-654-3210'
    },
    customOrderDetails: {
      specifications: 'Custom leather-bound book',
      requiredMaterials: 'Premium leather',
      estimatedCompletionTime: '2 weeks',
      additionalNotes: 'Customer wants embossed initials'
    },
    total: 199.99,
    paymentMethod: 'paypal',
    ...overrides
  };
}

// Generate admin data
function generateAdminData(overrides = {}) {
  return {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'password123',
    ...overrides
  };
}

module.exports = {
  generateProductData,
  generateOrderData,
  generateCustomOrderData,
  generateAdminData
}; 