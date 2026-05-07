describe('Checkout page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('menu.html');
    cy.get('.menu-item').first().within(() => {
      cy.get('.add-to-cart-btn').should('be.visible').click();
    });
    // Check that cart count is updated
    cy.get('#cartCount').should('contain', '1');
    cy.get('#loginMessage').invoke('css', 'display', 'none');
    cy.get('#checkoutBtn').should('be.visible').click();
  });

  it('loads the checkout page and shows a non-zero total', () => {
    cy.url().should('include', 'checkout.html');
    
    // Check if order items are displayed
    cy.get('#orderItems').children().should('have.length.greaterThan', 0);
    
    // Verify subtotal is not zero
    cy.get('#subtotal').invoke('text').should('not.equal', '0 ₫');
    
    // Verify total is not zero
    cy.get('#total').invoke('text').should('not.equal', '0 ₫');
  });

  it('lets the user select payment methods', () => {
    cy.get('#bankTransferPayment').click();
    cy.get('#bankTransfer').should('be.checked');
    cy.get('#cashPayment').click();
    cy.get('#cash').should('be.checked');
  });
});
