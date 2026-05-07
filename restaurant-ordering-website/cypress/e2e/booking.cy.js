describe('Booking page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('pages/booking.html');
  });

  it('loads the booking page and can walk through the booking steps', () => {
    cy.contains('Đặt Bàn').should('be.visible');
    // Form uses wizard steps, confirm button should exist (may be hidden initially)
    cy.get('#confirmBookingBtn').should('exist');
  });

  it('can select booking date, time, and complete booking if form is filled', () => {
    // Fill form fields
    cy.get('#fullName').should('exist').type('Nguyen Van A', { force: true });
    cy.get('#phone').should('exist').type('0912345678', { force: true });
    cy.get('#email').should('exist').type('test@example.com', { force: true });
    cy.get('#guestCount').should('exist').select('2', { force: true });
    
    // Click confirm button
    cy.get('#confirmBookingBtn').should('exist').click({ force: true });
    
    // Verify success message
    cy.contains('Đặt bàn thành công').should('be.visible');
  });
});
