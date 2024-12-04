// npm run c:open
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */

describe("Map Page Tests", () => {
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

    cy.visit(`${baseUrl}/map`);
  });
  it("should load the map page correctly", () => {
    cy.contains("h1", "Kiruna Map").should("be.visible"); // Check the title
    cy.get(".leaflet-container").should("be.visible"); // Verify that the map is present
  });

  it("should display map tiles", () => {
    cy.get(".leaflet-tile-pane img").should("have.length.greaterThan", 0); // Verify that the map tiles are loaded
  });

  it('should navigate back to the home page when clicking "Back to Home"', () => {
    cy.contains("button", "Back to Home").click(); // Find and click the button
    cy.url().should("eq", `${baseUrl}/`); // Verify that the URL has returned to the home page
  });

  it("allows the user to select an area from the dropdown", () => {
    cy.get(".dropdown-toggle").click(); // Open the dropdown
    cy.contains("Point-Based Documents").click(); // Select a specific option
    cy.get(".dropdown-toggle").should("contain", "Point-Based Documents"); // Verify that it has been updated
  });

  it("displays the correct markers when an area is selected", () => {
    cy.get(".dropdown-toggle").click();
    cy.contains("Point-Based Documents").click();

    // Assuming there are visible filtered markers
    cy.get(".leaflet-marker-icon").should("have.length.at.least", 1);
  });

});

/// <reference types="cypress" />
