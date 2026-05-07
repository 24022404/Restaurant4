describe('404 page behavior', () => {
  it('returns 404 for a missing page', () => {
    cy.request({ url: 'missing-page.html', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.equal(404);
    });
  });
});
