describe('Static information pages', () => {
  it('loads the About page', () => {
    cy.visit('about.html');
    cy.contains('Giới Thiệu').should('be.visible');
    cy.get('nav').contains('Trang Chủ').should('exist');
  });

  it('loads the Contact page', () => {
    cy.visit('contact.html');
    cy.contains('Liên Hệ').should('be.visible');
    cy.get('form').should('exist');
  });
});
