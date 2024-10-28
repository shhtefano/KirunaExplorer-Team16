/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */
describe("Home Page", () => {
  it("should display the heading", () => {
    // Adjust the URL to your local dev server
    cy.visit("http://localhost:5173");
    cy.contains("Kiruna Explorer").should("be.visible");
  });
});
