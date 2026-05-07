describe('Cart Functionality', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('menu.html');
  });

  describe('Adding Items to Cart', () => {
    it('should add single item to cart', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#cartCount').should('contain', '1');
    });

    it('should add multiple quantities of same item', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.quantity-input').clear().type('3');
        cy.get('.add-to-cart-btn').click();
      });
      cy.get('#cartCount').should('contain', '3');
    });

    it('should add different items to cart', () => {
      // Add first item
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      // Add second item
      cy.get('.menu-item').eq(1).within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.get('#cartCount').should('contain', '2');
    });
  });

  describe('Cart Panel Operations', () => {
    beforeEach(() => {
      // Add an item first
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });
    });

    it('should open cart panel when cart button is clicked', () => {
      cy.get('#cartButton').click();
      cy.get('#cartPanel').should('have.class', 'open');
    });

    it('should display cart items correctly', () => {
      cy.get('#cartButton').click();
      cy.get('.cart-item').should('have.length', 1);
      cy.get('.cart-total-price').should('not.contain', '0₫');
    });

    it('should update quantity in cart panel', () => {
      cy.get('#cartButton').click();
      cy.get('.cart-quantity-input').clear().type('2');
      cy.get('.cart-quantity-input').blur();
      cy.get('#cartCount').should('contain', '2');
    });

    it('should remove item from cart', () => {
      cy.get('#cartButton').click();
      cy.get('.remove-from-cart').click();
      cy.get('#cartCount').should('contain', '0');
      cy.get('.cart-item').should('have.length', 0);
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart across page reloads', () => {
      // Add item
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      // Reload page
      cy.reload();

      // Cart should still have the item
      cy.get('#cartCount').should('contain', '1');
    });

    it('should persist cart data in localStorage', () => {
      cy.get('.menu-item').first().within(() => {
        cy.get('.add-to-cart-btn').click();
      });

      cy.window().then((win) => {
        const cart = JSON.parse(win.localStorage.getItem('cart'));
        expect(cart).to.have.length(1);
        expect(cart[0]).to.have.property('quantity', 1);
      });
    });
  });
});