describe('Menu page', () => {
  beforeEach(() => {
    cy.visit('menu.html');
  });

  it('shows menu items and allows adding an item to the cart', () => {
    cy.get('.menu-item').should('have.length.greaterThan', 0);
    cy.get('.menu-item').first().within(() => {
      cy.get('.add-to-cart-btn').click();
    });
    cy.get('#cartPanel').should('have.class', 'open');
    cy.get('#cartCount').should('not.have.text', '0');
  });

  it('navigates to checkout from the cart panel', () => {
    cy.get('.menu-item').first().within(() => {
      cy.get('.add-to-cart-btn').click();
    });
    cy.get('#loginMessage').invoke('css', 'display', 'none');
    cy.get('#checkoutBtn').should('be.visible').click();
    cy.url().should('include', 'checkout.html');
  });
});
