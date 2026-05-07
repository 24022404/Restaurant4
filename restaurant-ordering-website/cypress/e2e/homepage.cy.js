describe('Website Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads the homepage and shows the hero content', () => {
    cy.contains('Việt Delights').should('be.visible');
    cy.contains('Đặt món trực tuyến').should('be.visible');
    cy.get('nav').should('exist');
  });

  it('navigates to the menu page from the header', () => {
    cy.get('nav a').contains('Thực Đơn').click();
    cy.url().should('include', 'menu.html');
    cy.contains('Thực Đơn').should('be.visible');
  });

  it('opens the login and register modals if clicked', () => {
    // Use force:true for buttons that might be covered
    cy.get('button').contains('Đăng nhập').click({ force: true });
    cy.get('#loginModal').should('be.visible');
    cy.get('#closeLogin').click({ force: true });
    cy.get('button').contains('Đăng ký').click({ force: true });
    cy.get('#registerModal').should('be.visible');
  });
});
