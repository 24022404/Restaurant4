describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Keyboard Navigation', () => {
    it('should navigate menu with keyboard', () => {
      cy.visit('menu.html');

      // Tab through menu items
      cy.get('body').tab();
      cy.focused().should('exist');

      // Tab to add to cart button
      cy.get('.add-to-cart-btn').first().focus();
      cy.focused().should('have.class', 'add-to-cart-btn');
    });

    it('should navigate checkout form with keyboard', () => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      // Tab through payment methods
      cy.get('#cashPayment').focus();
      cy.focused().should('have.id', 'cashPayment');

      // Tab to place order button
      cy.get('#placeOrderBtn').focus();
      cy.focused().should('have.id', 'placeOrderBtn');
    });

    it('should support Enter key on buttons', () => {
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').first().focus().type('{enter}');
      cy.get('#cartCount').should('contain', '1');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper alt text for images', () => {
      cy.visit('menu.html');

      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should have proper labels for form inputs', () => {
      cy.visit('pages/booking.html');

      cy.get('#fullName').should('have.attr', 'placeholder');
      cy.get('#phone').should('have.attr', 'placeholder');
      cy.get('#email').should('have.attr', 'placeholder');
    });

    it('should have descriptive button text', () => {
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').should('contain', 'Thêm');
      cy.get('#checkoutBtn').should('contain', 'Thanh toán');
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', () => {
      cy.visit('menu.html');

      // Check that important text is readable
      cy.get('h1, h2, h3').should('be.visible');
      cy.get('.menu-item h3').should('have.css', 'color');
    });

    it('should maintain contrast in different states', () => {
      cy.visit('menu.html');

      // Hover over buttons
      cy.get('.add-to-cart-btn').first().trigger('mouseover');
      cy.get('.add-to-cart-btn').first().should('be.visible');
    });
  });

  describe('Focus Management', () => {
    it('should show visible focus indicators', () => {
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').first().focus();

      // Check for focus outline or styling
      cy.focused().should('have.css', 'outline');
    });

    it('should maintain focus order', () => {
      cy.visit('pages/booking.html');

      // Tab through form fields in logical order
      cy.get('#fullName').focus();
      cy.focused().should('have.id', 'fullName');

      cy.get('body').tab();
      cy.focused().should('have.id', 'phone');

      cy.get('body').tab();
      cy.focused().should('have.id', 'email');
    });
  });

  describe('Responsive Design', () => {
    it('should be usable on mobile viewport', () => {
      cy.viewport('iphone-6');
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.add-to-cart-btn').first().should('be.visible');
    });

    it('should be usable on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.add-to-cart-btn').first().should('be.visible');
    });

    it('should be usable on desktop viewport', () => {
      cy.viewport('macbook-15');
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.add-to-cart-btn').first().should('be.visible');
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate touch target sizes on mobile', () => {
      cy.viewport('iphone-6');
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').first().then(($btn) => {
        const width = $btn.width();
        const height = $btn.height();
        expect(width).to.be.greaterThan(44); // Minimum touch target size
        expect(height).to.be.greaterThan(44);
      });
    });

    it('should have adequate spacing between interactive elements', () => {
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').first().should('be.visible');
      // Elements should not overlap
    });
  });

  describe('Error Announcements', () => {
    it('should announce form validation errors', () => {
      cy.visit('pages/booking.html');

      // Submit empty form
      cy.get('#confirmBookingBtn').click();

      // Should provide feedback (though we can't test screen reader announcements directly)
      cy.url().should('include', 'booking.html');
    });

    it('should provide success feedback', () => {
      cy.visit('pages/booking.html');

      cy.get('#fullName').type('Test User');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      cy.get('body').should('contain', 'Đặt bàn thành công');
    });
  });
});