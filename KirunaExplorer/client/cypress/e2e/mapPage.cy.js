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
  
    it('should allow creating a marker', () => {
        // Aspetta che l'elemento sia visibile prima di cliccare
        cy.get('.leaflet-draw-draw-marker', { timeout: 10000 }).should('be.visible').click();
        
        // Clicca sulla mappa per piazzare il marker
        cy.get('.leaflet-container').click(400, 300);
        
        // Verifica che il marker sia stato aggiunto
        cy.get('.leaflet-marker-icon').should('have.length', 1);
      });
      
    it('should navigate back to the home page when clicking "Back to Home"', () => {
      cy.contains('button', 'Back to Home').click(); // Trova e clicca il pulsante
      cy.url().should('eq', `${baseUrl}/`); // Verifica che l'URL sia tornato alla home
    });
  
    it('should fetch and display documents on the map', () => {
        // Intercetta la richiesta API e imposta un alias
        cy.intercept('GET', 'http://localhost:3001/api/document/geo/list', {
          statusCode: 200,
          body: [
            { id: 1, lat: 67.85, lng: 20.22, title: 'Document 1' },
            { id: 2, lat: 67.86, lng: 20.23, title: 'Document 2' },
          ],
        }).as('getDocuments');
        
        // Forza il caricamento della mappa
        cy.reload();
        
        // Aspetta la richiesta API
        cy.wait('@getDocuments', { timeout: 10000 }); // Aumenta il timeout se necessario
        
        // Verifica che i marker dei documenti siano visibili
        cy.get('.leaflet-marker-icon').should('have.length', 2);
      });
      
  });
  