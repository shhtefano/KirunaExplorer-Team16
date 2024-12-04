describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Kiruna Explorer Card", () => {
    it("displays the main card with correct content", () => {
      cy.get("h3").contains("Kiruna Explorer").should("be.visible");
      cy.contains("Welcome to Kiruna Explorer").should("be.visible");
    });

    it("has visible navigation buttons", () => {
      // Ensure the user is logged in with the correct role
      cy.stub(require("../../src/contexts/AuthContext"), "useAuth").returns({
        user: { role: "urban_planner", username: "testuser" },
        login: cy.stub(),
      });

      const navigationButtons = [
        { text: "Add doc" },
        { text: "See docs" },
        { text: "See Map" },
        { text: "See graph" },
      ];

      navigationButtons.forEach((button) => {
        cy.contains("button", button.text).should("be.visible");
      });
    });

    it("displays Map icons and GanttChart icon", () => {
      cy.get('[data-testid="map-icon"]').should("be.visible");
      cy.get('[data-testid="gantt-chart-icon"]').should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("navigates to map page", () => {
      cy.contains("button", "See Map").click();
      cy.url().should("include", "/map");
    });

    it("navigates to graph page", () => {
      cy.contains("button", "See graph").click();
      cy.url().should("include", "/graph");
    });

    it("navigates to add document page", () => {
      cy.contains("button", "Add doc").click();
      cy.url().should("include", "/add-document-description");
    });

    it("navigates to link document page", () => {
      cy.contains("button", "Link doc").click();
      cy.url().should("include", "/documents/link");
    });

    it("navigates to documents page", () => {
      cy.contains("button", "See docs").click();
      cy.url().should("include", "/documents");
    });
  });
});
