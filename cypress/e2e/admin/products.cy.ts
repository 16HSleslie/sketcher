describe('Admin Products Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.adminLogin('admin', 'adminpassword');
    // Navigate to products page
    cy.visit('/admin/products');
    // Wait for products to load
    cy.get('[data-cy=products-table]').should('be.visible');
  });

  it('should display products list', () => {
    cy.get('[data-cy=product-item]').should('have.length.at.least', 1);
    cy.get('[data-cy=add-product-button]').should('be.visible');
  });

  it('should filter products by category', () => {
    // Get initial product count
    cy.get('[data-cy=product-item]').then($items => {
      const initialCount = $items.length;
      
      // Select a category filter
      cy.get('[data-cy=category-filter]').select('Books');
      
      // Check that the filtered list has fewer or equal items
      cy.get('[data-cy=product-item]').its('length').should('be.lte', initialCount);
    });
  });

  it('should search products by name', () => {
    // Type search term
    cy.get('[data-cy=search-input]').type('Book');
    cy.get('[data-cy=search-button]').click();
    
    // Check that search results contain the search term
    cy.get('[data-cy=product-name]').each($el => {
      expect($el.text().toLowerCase()).to.include('book');
    });
  });

  it('should open product form when add button is clicked', () => {
    cy.get('[data-cy=add-product-button]').click();
    cy.get('[data-cy=product-form]').should('be.visible');
    cy.get('[data-cy=form-title]').should('contain', 'Add New Product');
  });

  it('should show validation errors when submitting empty form', () => {
    // Open form
    cy.get('[data-cy=add-product-button]').click();
    
    // Submit without filling
    cy.get('[data-cy=save-product-button]').click();
    
    // Check validation errors
    cy.get('[data-cy=name-error]').should('be.visible');
    cy.get('[data-cy=price-error]').should('be.visible');
    cy.get('[data-cy=category-error]').should('be.visible');
  });

  it('should add a new product successfully', () => {
    const productName = `Test Product ${Date.now()}`;
    
    // Open form
    cy.get('[data-cy=add-product-button]').click();
    
    // Fill form
    cy.get('[data-cy=name-input]').type(productName);
    cy.get('[data-cy=description-input]').type('This is a test product description');
    cy.get('[data-cy=price-input]').type('99.99');
    cy.get('[data-cy=category-input]').select('Books');
    cy.get('[data-cy=stock-input]').type('10');
    cy.get('[data-cy=available-checkbox]').check();
    
    // Submit form
    cy.get('[data-cy=save-product-button]').click();
    
    // Verify success message
    cy.get('[data-cy=success-toast]').should('be.visible')
      .and('contain', 'Product created successfully');
      
    // Verify product appears in list
    cy.get('[data-cy=product-name]').contains(productName).should('be.visible');
  });

  it('should edit an existing product', () => {
    // Click edit on first product
    cy.get('[data-cy=edit-product-button]').first().click();
    
    // Update name
    const newName = `Updated Product ${Date.now()}`;
    cy.get('[data-cy=name-input]').clear().type(newName);
    
    // Save changes
    cy.get('[data-cy=save-product-button]').click();
    
    // Verify success message
    cy.get('[data-cy=success-toast]').should('be.visible')
      .and('contain', 'Product updated successfully');
      
    // Verify updated product name appears
    cy.get('[data-cy=product-name]').contains(newName).should('be.visible');
  });

  it('should delete a product with confirmation', () => {
    // Get initial count
    cy.get('[data-cy=product-item]').then($items => {
      const initialCount = $items.length;
      
      // Click delete on first product
      cy.get('[data-cy=delete-product-button]').first().click();
      
      // Confirm deletion in modal
      cy.get('[data-cy=confirm-delete-button]').click();
      
      // Verify success message
      cy.get('[data-cy=success-toast]').should('be.visible')
        .and('contain', 'Product deleted successfully');
        
      // Verify product count reduced
      cy.get('[data-cy=product-item]').should('have.length', initialCount - 1);
    });
  });
}); 