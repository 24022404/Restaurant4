describe('Form Validation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Booking Form Validation', () => {
    beforeEach(() => {
      cy.visit('pages/booking.html');
    });

    it('should validate required fields', () => {
      cy.get('#confirmBookingBtn').click();
      // Should show validation messages or prevent submission
      cy.url().should('include', 'booking.html'); // Still on booking page
    });

    it('should validate email format', () => {
      cy.get('#fullName').type('Test User');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('invalid-email');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      // Should not proceed or show error
      cy.get('body').should('not.contain', 'Đặt bàn thành công');
    });

    it('should validate phone number format', () => {
      cy.get('#fullName').type('Test User');
      cy.get('#phone').type('invalid-phone');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      // Should not proceed or show error
      cy.get('body').should('not.contain', 'Đặt bàn thành công');
    });

    it('should accept valid booking form', () => {
      cy.get('#fullName').type('Nguyen Van A');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      cy.get('body').should('contain', 'Đặt bàn thành công');
    });
  });

  describe('Checkout Form Validation', () => {
    beforeEach(() => {
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();
    });

    it('should prevent order placement without payment method', () => {
      cy.get('#placeOrderBtn').should('be.disabled');
    });

    it('should allow order placement with payment method selected', () => {
      cy.get('#cashPayment').click();
      cy.get('#placeOrderBtn').should('not.be.disabled');
    });

    it('should prevent empty cart checkout', () => {
      // Clear cart
      cy.clearLocalStorage();
      cy.reload();

      // Try to access checkout directly
      cy.visit('checkout.html');
      cy.get('#placeOrderBtn').click();

      // Should show error message
      cy.get('body').should('contain', 'Giỏ hàng của bạn đang trống');
    });
  });

  describe('Quantity Validation', () => {
    beforeEach(() => {
      cy.visit('menu.html');
    });

    it('should enforce minimum quantity of 1', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.quantity-input').clear().type('0');
        cy.get('.add-to-cart-btn').click();
      });

      // Should not add to cart or show error
      cy.get('#cartCount').should('contain', '0');
    });

    it('should enforce maximum quantity limit', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.quantity-input').clear().type('11'); // Over max 10
        cy.get('.add-to-cart-btn').click();
      });

      // Should not add or limit to max
      cy.get('#cartCount').should('contain', '0');
    });

    it('should accept valid quantity', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.quantity-input').clear().type('5');
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartCount').should('contain', '5');
    });
  });

  describe('Input Field Validation', () => {
    it('should handle special characters in names', () => {
      cy.visit('pages/booking.html');
      cy.get('#fullName').type('Nguyễn Văn Á Đông');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      cy.get('body').should('contain', 'Đặt bàn thành công');
    });

    it('should handle long input values', () => {
      cy.visit('pages/booking.html');
      const longName = 'A'.repeat(100);
      cy.get('#fullName').type(longName);
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('test@example.com');
      cy.get('#guestCount').select('2');
      cy.get('#confirmBookingBtn').click();

      cy.get('body').should('contain', 'Đặt bàn thành công');
    });
  });
});