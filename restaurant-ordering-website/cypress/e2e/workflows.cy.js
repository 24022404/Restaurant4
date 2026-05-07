describe('Complete User Workflows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Happy Path - Complete Order Journey', () => {
    it('should complete full dine-in order from menu to confirmation', () => {
      // Step 1: Visit homepage
      cy.visit('/');
      cy.contains('Việt Delights').should('be.visible');

      // Step 2: Navigate to menu
      cy.get('nav a').contains('Thực Đơn').click();
      cy.url().should('include', 'menu.html');
      cy.contains('Thực Đơn').should('be.visible');

      // Step 3: Add items to cart
      cy.get('.menu-item').first().within(() => {
        cy.get('.quantity-input').clear().type('2');
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('.menu-item').eq(1).within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartCount').should('contain', '3');

      // Step 4: Hide login message and go to checkout
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();
      cy.url().should('include', 'checkout.html');

      // Step 5: Verify checkout page
      cy.get('#orderItems').children().should('have.length', 2);
      cy.get('#subtotal').should('not.contain', '0 ₫');
      cy.get('#total').should('not.contain', '0 ₫');

      // Step 6: Select payment method
      cy.get('#cashPayment').click();
      cy.get('#cash').should('be.checked');

      // Step 7: Place order
      cy.get('#placeOrderBtn').click();

      // Step 8: Verify order confirmation
      cy.get('body').should('contain', 'Đặt hàng thành công');
      cy.get('.confirmation-modal').should('be.visible');
    });

    it('should complete full delivery order with bank transfer', () => {
      // Set delivery option
      cy.window().then((win) => {
        win.localStorage.setItem('diningOption', 'delivery');
        win.localStorage.setItem('deliveryInfo', JSON.stringify({
          address: '123 Test Street',
          phone: '0912345678',
          note: 'Please ring doorbell'
        }));
      });

      // Step 1: Add items and go to checkout
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      // Step 2: Verify delivery info is shown
      cy.get('#deliveryInfo').should('be.visible');
      cy.get('#deliveryAddressText').should('contain', '123 Test Street');

      // Step 3: Select bank transfer
      cy.get('#bankTransferPayment').click();
      cy.get('#bankTransfer').should('be.checked');
      cy.get('#qrCodeContainer').should('be.visible');

      // Step 4: Verify delivery fee is added
      cy.get('#deliveryFee').should('not.contain', '0 ₫');

      // Step 5: Place order
      cy.get('#placeOrderBtn').click();
      cy.get('body').should('contain', 'Đặt hàng thành công');
    });
  });

  describe('Booking Workflow', () => {
    it('should complete full booking process', () => {
      // Step 1: Visit booking page
      cy.visit('pages/booking.html');
      cy.contains('Đặt Bàn').should('be.visible');

      // Step 2: Fill booking form
      cy.get('#fullName').type('Nguyen Van Test');
      cy.get('#phone').type('0912345678');
      cy.get('#email').type('booking@example.com');
      cy.get('#guestCount').select('4');

      // Step 3: Submit booking
      cy.get('#confirmBookingBtn').click();

      // Step 4: Verify confirmation
      cy.get('body').should('contain', 'Đặt bàn thành công');
      cy.get('.confirmation-modal').should('be.visible');

      // Step 5: Check booking is saved
      cy.window().then((win) => {
        const bookings = JSON.parse(win.localStorage.getItem('bookings') || '[]');
        expect(bookings).to.have.length.greaterThan(0);
        expect(bookings[0]).to.have.property('fullName', 'Nguyen Van Test');
      });
    });
  });

  describe('Account Management Workflow', () => {
    beforeEach(() => {
      // Set up user data
      cy.window().then((win) => {
        win.localStorage.setItem('user', JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '0912345678'
        }));

        // Add some orders
        const orders = [{
          id: 'OD001',
          items: [{ name: 'Test Item', price: 65000, quantity: 1 }],
          summary: { total: 65000 },
          status: 'completed',
          createdAt: new Date().toISOString()
        }];
        win.localStorage.setItem('orders', JSON.stringify(orders));

        // Add reservations
        const reservations = [{
          id: 'BK001',
          fullName: 'Test User',
          guestCount: 2,
          status: 'confirmed',
          createdAt: new Date().toISOString()
        }];
        win.localStorage.setItem('reservations', JSON.stringify(reservations));
      });
    });

    it('should navigate through account pages', () => {
      // Visit profile page
      cy.visit('pages/profile.html');
      cy.contains('Thông tin cá nhân').should('be.visible');

      // Navigate to orders
      cy.get('a[href="orders.html"]').click();
      cy.url().should('include', 'orders.html');
      cy.contains('Đơn hàng').should('be.visible');

      // Navigate to reservations
      cy.get('a[href="reservations.html"]').click();
      cy.url().should('include', 'reservations.html');
      cy.contains('Đặt bàn').should('be.visible');
    });

    it('should display order history', () => {
      cy.visit('pages/orders.html');

      cy.get('.order-item').should('have.length.greaterThan', 0);
      cy.get('.order-status').should('contain', 'completed');
    });

    it('should display reservation history', () => {
      cy.visit('pages/reservations.html');

      cy.get('.reservation-item').should('have.length.greaterThan', 0);
      cy.get('.reservation-status').should('contain', 'confirmed');
    });
  });

  describe('Error Recovery Workflows', () => {
    it('should recover from cart errors', () => {
      // Set corrupted cart
      cy.window().then((win) => {
        win.localStorage.setItem('cart', 'invalid');
      });

      cy.visit('menu.html');

      // Should still work
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartCount').should('contain', '1');
    });

    it('should handle network failures gracefully', () => {
      cy.visit('menu.html');

      // Add item
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      // Simulate network failure during checkout
      cy.intercept('GET', '**', { forceNetworkError: true }).as('networkError');

      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();

      // Should still load checkout page
      cy.url().should('include', 'checkout.html');
    });
  });

  describe('Cross-Page Navigation', () => {
    it('should maintain cart across page navigation', () => {
      // Add to cart on menu page
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      // Navigate to about page
      cy.get('nav a').contains('Giới thiệu').click();
      cy.url().should('include', 'about.html');

      // Navigate back to menu
      cy.get('nav a').contains('Thực Đơn').click();
      cy.url().should('include', 'menu.html');

      // Cart should still have items
      cy.get('#cartCount').should('contain', '1');
    });

    it('should handle back/forward navigation', () => {
      cy.visit('menu.html');
      cy.get('nav a').contains('Thực Đơn').click();
      cy.url().should('include', 'menu.html');

      cy.go('back');
      cy.url().should('include', 'index.html');

      cy.go('forward');
      cy.url().should('include', 'menu.html');
    });
  });

  describe('Data Persistence Workflows', () => {
    it('should persist user preferences', () => {
      // Set dining preference
      cy.window().then((win) => {
        win.localStorage.setItem('diningOption', 'delivery');
      });

      cy.visit('checkout.html');

      // Should remember dining option
      cy.window().then((win) => {
        expect(win.localStorage.getItem('diningOption')).to.equal('delivery');
      });
    });

    it('should maintain order history', () => {
      // Complete an order
      cy.visit('menu.html');
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#loginMessage').invoke('css', 'display', 'none');
      cy.get('#checkoutBtn').click();
      cy.get('#cashPayment').click();
      cy.get('#placeOrderBtn').click();

      // Check orders are saved
      cy.window().then((win) => {
        const orders = JSON.parse(win.localStorage.getItem('orders') || '[]');
        expect(orders).to.have.length.greaterThan(0);
      });

      // Visit orders page
      cy.visit('pages/orders.html');
      cy.get('.order-item').should('have.length.greaterThan', 0);
    });
  });
});