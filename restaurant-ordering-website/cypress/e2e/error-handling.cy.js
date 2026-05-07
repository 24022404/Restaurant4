describe('Error Handling', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Network Error Scenarios', () => {
    it('should handle missing images gracefully', () => {
      cy.visit('menu.html');
      // Check that broken images don't break the page
      cy.get('img').each(($img) => {
        cy.wrap($img).should('be.visible');
      });
    });

    it('should handle localStorage corruption', () => {
      // Set corrupted localStorage data
      cy.window().then((win) => {
        win.localStorage.setItem('cart', 'invalid json');
        win.localStorage.setItem('cartSummary', 'invalid json');
      });

      cy.visit('menu.html');
      // Page should still load without errors
      cy.contains('Thực Đơn').should('be.visible');
    });
  });

  describe('Invalid URL Handling', () => {
    it('should show 404 page for non-existent routes', () => {
      cy.visit('non-existent-page.html', { failOnStatusCode: false });
      cy.get('body').should('contain', '404');
    });

    it('should handle invalid query parameters', () => {
      cy.visit('menu.html?invalid=param&another=param');
      // Page should still load normally
      cy.contains('Thực Đơn').should('be.visible');
    });
  });

  describe('JavaScript Error Handling', () => {
    it('should handle missing DOM elements gracefully', () => {
      cy.visit('checkout.html');
      // Should not crash even if some elements are missing
      cy.url().should('include', 'checkout.html');
    });

    it('should handle invalid localStorage data', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('diningOption', 'invalid');
        win.localStorage.setItem('deliveryInfo', 'invalid json');
      });

      cy.visit('checkout.html');
      // Should handle gracefully
      cy.url().should('include', 'checkout.html');
    });
  });

  describe('Form Error Handling', () => {
    it('should handle form submission with network issues', () => {
      cy.visit('pages/booking.html');

      // Fill form
      cy.get('#fullName').type('Test User');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');

      // Simulate network failure by blocking requests
      cy.intercept('POST', '**', { forceNetworkError: true }).as('networkError');

      cy.get('#confirmBookingBtn').click();

      // Should handle the error gracefully
      cy.get('body').should('not.contain', 'Đặt bàn thành công');
    });

    it('should handle duplicate submissions', () => {
      cy.visit('pages/booking.html');

      // Fill form
      cy.get('#fullName').type('Test User');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');

      // Click submit multiple times quickly
      cy.get('#confirmBookingBtn').click();
      cy.get('#confirmBookingBtn').click();
      cy.get('#confirmBookingBtn').click();

      // Should only process once
      cy.get('body').should('contain', 'Đặt bàn thành công');
    });
  });

  describe('Cart Error Handling', () => {
    it('should handle cart with invalid items', () => {
      // Set cart with invalid item data
      cy.window().then((win) => {
        const invalidCart = [
          { id: 1, name: 'Test', price: 'invalid', quantity: 1 },
          { id: 999, name: 'Non-existent', price: 10000, quantity: 1 }
        ];
        win.localStorage.setItem('cart', JSON.stringify(invalidCart));
      });

      cy.visit('checkout.html');
      // Should handle gracefully and show some total
      cy.get('#total').should('be.visible');
    });

    it('should handle empty cart gracefully', () => {
      cy.visit('checkout.html');
      // Should show empty cart message or redirect
      cy.url().should('include', 'checkout.html');
    });

    it('should handle cart with zero quantity items', () => {
      cy.window().then((win) => {
        const cartWithZero = [
          { id: 1, name: 'Test', price: 65000, quantity: 0 }
        ];
        win.localStorage.setItem('cart', JSON.stringify(cartWithZero));
      });

      cy.visit('checkout.html');
      // Should handle zero quantity
      cy.get('#total').invoke('text').should('equal', '0 ₫');
    });
  });

  describe('Payment Error Handling', () => {
    beforeEach(() => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();
    });

    it('should handle payment method switching during processing', () => {
      cy.get('#cashPayment').click();

      // Try to switch payment method quickly
      cy.get('#bankTransferPayment').click();
      cy.get('#cashPayment').click();

      // Should maintain valid state
      cy.get('#placeOrderBtn').should('not.be.disabled');
    });

    it('should handle order placement with invalid payment data', () => {
      // Manually set invalid payment method
      cy.window().then((win) => {
        win.document.querySelector('#cash').checked = false;
        win.document.querySelector('#bankTransfer').checked = false;
      });

      cy.get('#placeOrderBtn').click();
      // Should not proceed
      cy.url().should('include', 'checkout.html');
    });
  });
});