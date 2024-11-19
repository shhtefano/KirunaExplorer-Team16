//npx cypress open

describe('Map Page Tests', () => {
    const baseUrl = 'http://localhost:5173';
  
    beforeEach(() => {
        // Esegui una richiesta API per fare login
        cy.request({
          method: 'POST',
          url: 'http://localhost:3001/api/sessions',
          body: {
            username: 'test',
            password: 'test'
          }
        }).then((response) => {
          // Salva il token nel localStorage o nei cookie per la sessione
          window.localStorage.setItem('auth_token', response.body.token);
        });
    
        cy.visit(`${baseUrl}/map`);
      });
    it('should load the map page correctly', () => {
      cy.contains('h1', 'Kiruna Map').should('be.visible'); // Controlla il titolo
      cy.get('.leaflet-container').should('be.visible'); // Verifica che la mappa sia presente
    });
  
    it('should display map tiles', () => {
      cy.get('.leaflet-tile-pane img').should('have.length.greaterThan', 0); // Verifica che i riquadri della mappa siano caricati
    });

      
    it('should navigate back to the home page when clicking "Back to Home"', () => {
      cy.contains('button', 'Back to Home').click(); // Trova e clicca il pulsante
      cy.url().should('eq', `${baseUrl}/`); // Verifica che l'URL sia tornato alla home
    });
  
   

  it('allows the user to select an area from the dropdown', () => {
    cy.get('.dropdown-toggle').click(); // Apri il dropdown
    cy.contains('Point-Based Documents').click(); // Seleziona un'opzione specifica
    cy.get('.dropdown-toggle').should('contain', 'Point-Based Documents'); // Verifica che sia stato aggiornato
  });

  it('displays the correct markers when an area is selected', () => {
    cy.get('.dropdown-toggle').click();
    cy.contains('Point-Based Documents').click();

    // Supponendo che ci siano marker filtrati visibili
    cy.get('.leaflet-marker-icon').should('have.length.at.least', 1);
  });

  it('opens the document details modal when a marker is clicked', () => {
    // Seleziona un'area con marker
    cy.get('.dropdown-toggle').click();
    cy.contains('Point-Based Documents').click();

    // Clicca sul primo marker visibile
    cy.get('.leaflet-marker-icon').first().click();

    // Verifica che il modal sia visibile
    cy.get('.modal-title').should('contain', 'Document info');
  });

  });
  
  /// <reference types="cypress" />
