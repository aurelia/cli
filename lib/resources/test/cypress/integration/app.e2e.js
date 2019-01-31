describe('Aurelia skeleton app', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the page and display the initial page title', () => {
    cy.title().should('equal', 'Aurelia Navigation Skeleton');
  });

  it('should display greeting', () => {
    cy.get('h1').contains('Hello World!');
  });
});
