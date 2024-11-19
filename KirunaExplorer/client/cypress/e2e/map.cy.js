/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */

describe("DrawMap Component", () => {
  describe("Visitor Access", () => {
    beforeEach(() => {
      cy.visit("/map");
    });

    it("displays map with basic elements", () => {
      cy.get(".leaflet-container").should("be.visible");
      cy.get("#dropdown-basic").should("contain", "Point-Based Documents");
      cy.get('input[placeholder="Search..."]').should("be.visible");
    });

    it("shows document info but no edit buttons", () => {
      cy.contains("Point-Based Documents").should("be.visible");
      cy.get(".leaflet-marker-icon").first().click();
      cy.get(".modal-title").should("contain", "Document info");
      cy.get(".mt-4").should("not.exist");
    });
  });

  describe("Authenticated User Access", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.get('input[placeholder="Enter your username"]').type("test");
      cy.get('input[placeholder="******"]').type("test");
      cy.get('button[type="submit"]').click();
      cy.visit("/map");
    });

    it("shows edit controls for markers", () => {
      cy.get(".leaflet-draw").should("be.visible");
    });

    it("can toggle between point and whole area view", () => {
      cy.get("#dropdown-basic").click();
      cy.contains("Whole Area").click();
      cy.get("#dropdown-basic").should("contain", "Whole Area");

      cy.get("#dropdown-basic").click();
      cy.contains("Point-Based Documents").click();
      cy.get("#dropdown-basic").should("contain", "Point-Based Documents");
    });

    it("can edit document position", () => {
      // Click on document in sidebar to show edit buttons
      cy.get(".mt-3").first().click();

      // Click the map icon button in sidebar
      cy.get("button.mt-4").last().click();
      cy.get(".modal-title").should("contain", "Change Document Position");

      // Test coordinate inputs
      cy.get('input[type="number"]').first().clear().type("67.8558");
      cy.get('input[type="number"]').last().clear().type("20.2253");

      // Test whole area checkbox
      cy.get('input[type="checkbox"]').click();
      cy.get('input[type="number"]').should("be.disabled");
    });

    // it("shows success message after position update", () => {
    //   cy.get(".mt-3").first().click();
    //   cy.get("button.mt-4").last().click();
    //   cy.get('input[type="checkbox"]').click();
    //   cy.contains("button", "Save").click();
    //   cy.get('[data-testid="alert"]').should(
    //     "contain",
    //     "Document position successfully updated"
    //   );
    // });
  });
});
