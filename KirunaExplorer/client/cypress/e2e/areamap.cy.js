describe('Protected AreaMap Page', () => {
    const username = 'urban_planner';
    const password = 'urban_planner';
  
    beforeEach(() => {
      // Effettua il login tramite l'API e salva il cookie di sessione
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/sessions',
        body: { username, password },
      }).then((response) => {
        expect(response.status).to.eq(201); // Verifica che il login abbia successo
        const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.includes('connect.sid'));
        cy.setCookie('connect.sid', sessionCookie.split(';')[0].split('=')[1]);
      });
    });
  
    it('should render the AreaMap page for authenticated users', () => {
      // Visita la pagina protetta
      cy.visit('http://localhost:5173/areas');
  
      // Verifica che il titolo sia visibile
      cy.contains('h1', 'Area Map').should('be.visible');
  
      // Verifica che il componente mappa (canvas) esista
    //   cy.get('canvas').should('exist'); // Supponiamo che la mappa sia renderizzata su canvas
  
      // Verifica che il pulsante "Back to Home" sia visibile
      cy.contains('button', 'Back to Home').should('be.visible');
    });
  });
  
  
  describe('Protected AreaMap Page (UI Login)', () => {
    const username = 'urban_planner';
    const password = 'urban_planner';
  
    it('should log in and access the AreaMap page', () => {
      // Visita la pagina di login
      cy.visit('http://localhost:5173/'); 
  
      // Inserisci username e password
      cy.get('input[name="username"]').should('be.visible').type(username);
      cy.get('input[name="password"]').should('be.visible').type(password);
  
      // Clicca sul pulsante di login
      cy.get('button[type="submit"]').should('be.visible').click();
      cy.visit('http://localhost:5173/areas'); 

      // Verifica che il login sia avvenuto correttamente e che la pagina AreaMap venga caricata
      cy.url().should('eq', 'http://localhost:5173/areas');
      cy.contains('h1', 'Area Map').should('be.visible');
    });
  });
  