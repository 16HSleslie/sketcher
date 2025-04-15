describe('Admin Login', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/admin/login');
  });

  it('should display login form', () => {
    cy.get('[data-cy=login-form]').should('be.visible');
    cy.get('[data-cy=username-input]').should('be.visible');
    cy.get('[data-cy=password-input]').should('be.visible');
    cy.get('[data-cy=login-button]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=username-error]').should('be.visible');
    cy.get('[data-cy=password-error]').should('be.visible');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('[data-cy=username-input]').type('wronguser');
    cy.get('[data-cy=password-input]').type('wrongpass');
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=login-error]').should('be.visible')
      .and('contain', 'Invalid username or password');
  });

  it('should login successfully with valid credentials', () => {
    // This assumes there's a test user in the database
    cy.get('[data-cy=username-input]').type('admin');
    cy.get('[data-cy=password-input]').type('adminpassword');
    cy.get('[data-cy=login-button]').click();
    
    // Check that we're redirected to dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.get('[data-cy=dashboard-title]').should('contain', 'Admin Dashboard');
    cy.get('[data-cy=admin-profile]').should('contain', 'admin');
  });
}); 