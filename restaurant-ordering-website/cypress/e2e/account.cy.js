describe('Account pages', () => {
  const userData = {
    fullName: 'Nguyen Test',
    email: 'testuser@example.com',
    phone: '0912345678',
    address: 'Hanoi, Vietnam',
    birthDate: '1990-01-01'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('loggedInUser', JSON.stringify(userData));
      win.localStorage.setItem('orders', JSON.stringify([]));
      win.localStorage.setItem('bookings', JSON.stringify([]));
    });
  });

  it('shows user profile information', () => {
    cy.visit('pages/profile.html');
    cy.contains(userData.fullName).should('be.visible');
    cy.contains(userData.email).should('be.visible');
    cy.contains(userData.phone).should('be.visible');
  });

  it('shows empty orders page when no orders exist', () => {
    cy.visit('pages/orders.html');
    cy.contains('Chưa có đơn hàng').should('be.visible');
  });

  it('shows empty reservations page when no bookings exist', () => {
    cy.visit('pages/reservations.html');
    cy.contains('Chưa có lịch đặt bàn').should('be.visible');
  });
});
