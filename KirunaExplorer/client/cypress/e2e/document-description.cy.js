/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */

describe("Document Form", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('input[placeholder="Enter your username"]').type("test");
    cy.get('input[placeholder="******"]').type("test");
    cy.get('button[type="submit"]').click();
    cy.visit("/add-document-description");
  });

  it("displays form title and fields after login", () => {
    cy.contains("h3", "Add new document").should("be.visible");
    cy.contains("Document type").should("be.visible");
    cy.contains("Stakeholder").should("be.visible");
  });

  it("shows validation messages for empty form", () => {
    cy.contains("button", "Add document description").click();
    cy.contains("A document title is required").should("be.visible");
    cy.contains("A description is required").should("be.visible");
    cy.contains("You have to select a document type").should("be.visible");
    cy.contains("Scale is required").should("be.visible");
    cy.contains("The date of issuance is required").should("be.visible");
  });

  it("validates input formats", () => {
    cy.get('input[name="scale"]').type("1:");
    cy.get('input[name="issuance_date"]').type("202");
    cy.get('textarea[name="document_description"]').type("a");

    cy.contains("button", "Add document description").click();

    cy.contains("Scale must be at least 3 characters").should("be.visible");
    cy.contains(
      "Please write the date in the correct format: YYYY, YYYY-MM, or YYYY-MM-DD"
    ).should("be.visible");
    cy.contains("Description must be at least 2 characters").should(
      "be.visible"
    );
  });
});
