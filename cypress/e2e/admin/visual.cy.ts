describe('Admin Panel Visual Regression Tests', () => {
  beforeEach(() => {
    // Login before each visual test
    cy.adminLogin('admin', 'adminpassword');
  });

  it('should visually match dashboard', () => {
    cy.visit('/admin/dashboard');
    
    // Wait for dashboard data to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Dashboard');
  });

  it('should visually match products list', () => {
    cy.visit('/admin/products');
    
    // Wait for products to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Products List');
  });

  it('should visually match add product form', () => {
    cy.visit('/admin/products');
    
    // Wait for products to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Open the add product form
    cy.get('[data-cy=add-product-button]').click();
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Add Product Form');
  });

  it('should visually match edit product form', () => {
    cy.visit('/admin/products');
    
    // Wait for products to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Click edit on first product
    cy.get('[data-cy=edit-product-button]').first().click();
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Edit Product Form');
  });

  it('should visually match orders list', () => {
    cy.visit('/admin/orders');
    
    // Wait for orders to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Orders List');
  });

  it('should visually match order details', () => {
    cy.visit('/admin/orders');
    
    // Wait for orders to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Click on first order to view details
    cy.get('[data-cy=view-order-details]').first().click();
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Order Details');
  });

  it('should visually match admin profile', () => {
    cy.visit('/admin/profile');
    
    // Wait for profile to load
    cy.get('[data-cy=loading-indicator]').should('not.exist');
    
    // Take a Percy snapshot
    cy.percySnapshot('Admin Profile');
  });
}); 