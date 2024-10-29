/* eslint-disable no-unused-vars */
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    excludeSpecPattern: ["cypress/e2e/examples/*/*.cy.js"],
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});
