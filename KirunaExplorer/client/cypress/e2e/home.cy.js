/* eslint-disable jest/no-disabled-tests */
/* eslint-disable jest/expect-expect */
/* eslint-disable no-undef */

describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Kiruna Explorer Card", () => {
    it("displays the main card with correct content", () => {
      cy.get("h3").contains("Kiruna Explorer").should("be.visible");
      cy.contains("Welcome to Kiruna Explorer").should("be.visible");
      cy.contains("exploring the incredible project").should("be.visible");
    });

    it("has visible navigation buttons", () => {
      const navigationButtons = [
        { text: "Add doc" },
        { text: "Link doc" },
        { text: "See docs" },
        { text: "See Map" },
        { text: "See graph" },
      ];

      navigationButtons.forEach((button) => {
        cy.contains("button", button.text).should("be.visible");
      });
    });

    it("displays Map icons and GanttChart icon", () => {
      // First Map icon with data-testid
      cy.get('[data-testid="map-icon"]').should("be.visible");
      // GanttChart icon
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
})

// describe("Home Page", () => {
//   beforeEach(() => {
//     cy.visit("/");
//   });

//   describe("Kiruna Explorer Card", () => {
//     it("displays the main card with correct content", () => {
//       cy.get("h3").contains("Kiruna Explorer").should("be.visible");
//       cy.contains("Welcome to Kiruna Explorer").should("be.visible");
//       cy.contains("exploring the incredible project").should("be.visible");
//     });

//     it("has working navigation buttons", () => {
//       cy.get('a[href="/map"]')
//         .should("be.visible")
//         .find("button")
//         .contains("See Map")
//         .should("be.visible");
//       cy.get('a[href="/graph"]')
//         .should("be.visible")
//         .find("button")
//         .contains("See graph")
//         .should("be.visible");
//     });

//     it("shows toast when clicking microwave button", () => {
//       cy.get('button[aria-label="Microwave"]').click();
//       cy.contains("Created Kiruna Event").should("be.visible");
//       cy.contains("Sunday, November 01, 2024 at 9:00 AM").should("be.visible");
//       cy.contains("button", "Undo").should("be.visible");
//     });
//   });

//   describe("Document Description Form", () => {
//     it("displays the form with all elements", () => {
//       cy.contains("Add document description").should("be.visible");
//       cy.get('[role="combobox"]').should("be.visible");
//       cy.get('textarea[placeholder="Your document description"]').should(
//         "be.visible"
//       );
//       cy.contains("button", "Add document").should("be.visible");
//     });

//     it("shows validation errors on empty submission", () => {
//       cy.contains("button", "Add document").click();
//       cy.contains("You have to select a document").should("be.visible");
//       cy.contains("A description is required").should("be.visible");
//     });

//     it("successfully submits form with valid data", () => {
//       // Use force: true for the select interaction
//       cy.get('[role="combobox"]').click();
//       cy.get('[role="option"]')
//         .contains("Example document #1")
//         .click({ force: true });

//       cy.get('textarea[placeholder="Your document description"]').type(
//         "This is a test description"
//       );

//       cy.contains("button", "Add document").click();

//       cy.contains("Added document description").should("be.visible");
//     });

//     it("validates description length", () => {
//       // Select document first
//       cy.get('[role="combobox"]').click();
//       cy.get('[role="option"]')
//         .contains("Example document #1")
//         .click({ force: true });

//       // Test too short description
//       cy.get('textarea[placeholder="Your document description"]').type("a");
//       cy.contains("button", "Add document").click();
//       cy.contains("Description must be at least 2 characters").should(
//         "be.visible"
//       );

//       // Clear and test too long description
//       cy.get('textarea[placeholder="Your document description"]')
//         .clear()
//         .type("a".repeat(201));
//       cy.contains("button", "Add document").click();
//       cy.contains("Description must be less than 200 characters").should(
//         "be.visible"
//       );
//     });
//   });

//   describe("Navigation and Layout", () => {
//     it("has correct layout structure", () => {
//       // Check the actual classes that exist in your component
//       cy.get("div")
//         .first()
//         .should("have.class", "flex")
//         .should("have.class", "flex-col")
//         .should("have.class", "w-full");
//     });

//     it("navigates to correct pages", () => {
//       // Test Map navigation
//       cy.get('a[href="/map"]').click();
//       cy.url().should("include", "/map");
//       cy.go("back");

//       // Test Graph navigation
//       cy.get('a[href="/graph"]').click();
//       cy.url().should("include", "/graph");
//       cy.go("back");
//     });
//   });

// });
