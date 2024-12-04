describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Kiruna Explorer Card", () => {
    it("displays the main card with correct content", () => {
      cy.get("h3").contains("Kiruna Explorer").should("be.visible");
    });

    it("has visible navigation buttons", () => {
      // Ensure the user is logged in with the correct role
      cy.stub(require("../../src/contexts/AuthContext"), "useAuth").returns({
        user: { role: "urban_planner", username: "testuser" },
        login: cy.stub(),
      });

      const navigationButtons = [
        { text: "See Docs" },
        { text: "See Map" },
      ];

      navigationButtons.forEach((button) => {
        cy.contains("button", button.text).should("be.visible");
      });
    });

  });

  describe("Navigation", () => {

    const baseUrl = "http://localhost:5173";

    beforeEach(() => {
      // Make an API request to log in
      cy.request({
        method: "POST",
        url: "http://localhost:3001/api/sessions",
        body: {
          username: "urban_planner",
          password: "urban_planner",
        },
      }).then((response) => {
        // Save the token in localStorage or cookies for the session
        window.localStorage.setItem("auth_token", response.body.token);
      });
  
    });

    it("navigates to map page", () => {
      cy.contains("button", "See Map").click();
      cy.url().should("include", "/map");
    });

    it("navigates to documents page", () => {
      cy.contains("button", "See Docs").click();
      cy.url().should("include", "/documents/list");
    });
  });
});
