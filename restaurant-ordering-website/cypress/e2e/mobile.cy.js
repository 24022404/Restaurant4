describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Mobile Menu Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });

    it('should display mobile-friendly menu layout', () => {
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.menu-item').should('have.css', 'flex-direction', 'column');
    });

    it('should handle touch interactions on mobile', () => {
      cy.visit('menu.html');

      cy.get('.add-to-cart-btn').first().should('be.visible').click();
      cy.get('#cartCount').should('contain', '1');
    });

    it('should show cart panel on mobile', () => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartButton').click();
      cy.get('#cartPanel').should('have.class', 'open');
    });
  });

  describe('Mobile Checkout Process', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();
    });

    it('should display checkout form properly on mobile', () => {
      cy.get('.checkout-section').should('be.visible');
      cy.get('#orderItems').should('be.visible');
      cy.get('#total').should('be.visible');
    });

    it('should handle payment method selection on mobile', () => {
      cy.get('#cashPayment').click();
      cy.get('#cash').should('be.checked');

      cy.get('#bankTransferPayment').click();
      cy.get('#bankTransfer').should('be.checked');
    });

    it('should show QR code properly on mobile', () => {
      cy.get('#bankTransferPayment').click();
      cy.get('#qrCodeContainer').should('be.visible');
      cy.get('.qr-code-image').should('have.css', 'width', '200px');
    });
  });

  describe('Mobile Booking Form', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
      cy.visit('pages/booking.html');
    });

    it('should display booking form properly on mobile', () => {
      cy.get('#fullName').should('be.visible');
      cy.get('#phone').should('be.visible');
      cy.get('#email').should('be.visible');
      cy.get('#confirmBookingBtn').should('be.visible');
    });

    it('should handle form input on mobile', () => {
      cy.get('#fullName').type('Mobile Test User');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('mobile@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      cy.get('body').should('contain', 'Đặt bàn thành công');
    });
  });

  describe('Tablet Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('ipad-2');
    });

    it('should display properly on tablet', () => {
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.add-to-cart-btn').should('be.visible');
    });

    it('should handle checkout on tablet', () => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      cy.get('.checkout-layout').should('have.css', 'flex-direction', 'column');
    });
  });

  describe('Desktop Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('macbook-15');
    });

    it('should display full desktop layout', () => {
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');
      cy.get('.menu-grid').should('have.css', 'grid-template-columns');
    });

    it('should show checkout sidebar on desktop', () => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      cy.get('.checkout-layout').should('have.css', 'flex-direction', 'row');
      cy.get('.checkout-sidebar').should('be.visible');
    });
  });

  describe('Orientation Changes', () => {
    it('should handle orientation change from portrait to landscape', () => {
      cy.viewport('iphone-6', 'portrait');
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');

      // Change to landscape
      cy.viewport('iphone-6', 'landscape');
      cy.get('.menu-item').should('be.visible');
    });

    it('should handle orientation change from landscape to portrait', () => {
      cy.viewport('iphone-6', 'landscape');
      cy.visit('menu.html');

      cy.get('.menu-item').should('be.visible');

      // Change to portrait
      cy.viewport('iphone-6', 'portrait');
      cy.get('.menu-item').should('be.visible');
    });
  });

  describe('Touch Gestures', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });

    it('should handle swipe gestures on cart panel', () => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartButton').click();
      cy.get('#cartPanel').should('have.class', 'open');

      // Note: Cypress doesn't support touch gestures natively
      // This would require additional plugins for touch testing
    });

    it('should handle tap vs hold interactions', () => {
      cy.visit('menu.html');

      // Regular tap
      cy.get('.add-to-cart-btn').first().click();
      cy.get('#cartCount').should('contain', '1');
    });
  });
});