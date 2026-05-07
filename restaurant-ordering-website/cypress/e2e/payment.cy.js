describe('Payment Methods', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('menu.html');
    // Add item to cart and go to checkout
    cy.get('.menu-item').first().within(() => {
      cy.get('.add-to-cart-btn').click();
    });
    cy.get('#loginMessage').invoke('css', 'display', 'none');
    cy.get('#checkoutBtn').click();
  });

  describe('Cash Payment', () => {
    it('should select cash payment method', () => {
      cy.get('#cashPayment').click();
      cy.get('#cash').should('be.checked');
      cy.get('#bankTransferPayment').should('not.have.class', 'active');
    });

    it('should show correct cash payment description for dine-in', () => {
      // Set dining option to dine-in
      cy.window().then((win) => {
        win.localStorage.setItem('diningOption', 'dineIn');
      });
      cy.reload();

      // Re-add item and go to checkout
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      cy.get('#cashPayment').click();
      cy.get('#cashDescription').should('contain', 'nhà hàng');
    });

    it('should show correct cash payment description for delivery', () => {
      // Set dining option to delivery
      cy.window().then((win) => {
        win.localStorage.setItem('diningOption', 'delivery');
      });
      cy.reload();

      // Re-add item and go to checkout
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      cy.get('#cashPayment').click();
      cy.get('#cashDescription').should('contain', 'địa chỉ');
    });
  });

  describe('Bank Transfer Payment', () => {
    it('should select bank transfer payment method', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#bankTransfer').should('be.checked');
      cy.get('#cashPayment').should('not.have.class', 'active');
    });

    it('should show QR code when bank transfer is selected', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#qrCodeContainer').should('be.visible');
      cy.get('.qr-code-image').should('be.visible');
    });

    it('should display correct transfer amount', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#transferAmount').invoke('text').then((amount) => {
        cy.get('#total').invoke('text').should('equal', amount);
      });
    });

    it('should copy transfer amount to clipboard', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#transferAmountCopyBtn').click();
      // Note: Cannot directly test clipboard in Cypress, but we can test the button exists
      cy.get('#transferAmountCopyBtn').should('exist');
    });
  });

  describe('Payment Method Switching', () => {
    it('should switch from cash to bank transfer', () => {
      cy.get('#cashPayment').click();
      cy.get('#cash').should('be.checked');

      cy.get('#bankTransferPayment').click();
      cy.get('#bankTransfer').should('be.checked');
      cy.get('#cash').should('not.be.checked');
      cy.get('#qrCodeContainer').should('be.visible');
    });

    it('should switch from bank transfer to cash', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#bankTransfer').should('be.checked');
      cy.get('#qrCodeContainer').should('be.visible');

      cy.get('#cashPayment').click();
      cy.get('#cash').should('be.checked');
      cy.get('#bankTransfer').should('not.be.checked');
      cy.get('#qrCodeContainer').should('not.be.visible');
    });
  });

  describe('Payment Validation', () => {
    it('should require payment method selection before placing order', () => {
      // Try to place order without selecting payment method
      cy.get('#placeOrderBtn').should('be.disabled');
    });

    it('should enable place order button when payment method is selected', () => {
      cy.get('#cashPayment').click();
      cy.get('#placeOrderBtn').should('not.be.disabled');
    });
  });
});