// ***********************************************************
// This file supports the e2e tests with custom commands
// ***********************************************************

// Declare global Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login to admin panel
       * @example cy.adminLogin('admin', 'password')
       */
      adminLogin(username: string, password: string): Chainable<Element>;
    }
  }
}

// Admin login command
Cypress.Commands.add('adminLogin', (username: string, password: string) => {
  cy.visit('/admin/login');
  cy.get('[data-cy=username-input]').type(username);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  // Wait until we're redirected to dashboard
  cy.url().should('include', '/admin/dashboard');
});

export {}; 