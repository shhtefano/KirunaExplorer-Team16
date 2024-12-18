/// <reference types="cypress" />

/* eslint-disable no-undef */
describe("Map Page Tests", () => {
  const baseUrl = "http://localhost:5173";

  beforeEach(() => {
    // Effettua login tramite API e salva il token in localStorage
    cy.request({
      method: "POST",
      url: "http://localhost:3001/api/sessions",
      body: {
        username: "urban_planner",
        password: "urban_planner",
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      window.localStorage.setItem("auth_token", response.body.token);
    });

    // Visita la pagina della mappa
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
    // Apri il menu a tendina e seleziona un'area
    cy.get(".dropdown-toggle", { timeout: 10000 }).click();
    cy.contains("Point-Based Documents").click();

    // Verifica che l'area selezionata sia corretta
    cy.get(".dropdown-toggle").should("contain", "Point-Based Documents");
  });

  it("displays the correct markers when an area is selected", () => {
    // Seleziona un'area
    cy.get(".dropdown-toggle", { timeout: 10000 }).click();
    cy.contains("Point-Based Documents").click();

    // Verifica che ci siano marker visibili
    cy.get(".leaflet-marker-icon", { timeout: 10000 }).should("have.length.at.least", 1);
  });
});
