describe('Protected Diagram Page - Basic Tests', () => {
    const username = 'urban_planner';
    const password = 'urban_planner';
  
    beforeEach(() => {
      // Login via API
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/sessions',
        body: { username, password },
      }).then((response) => {
        expect(response.status).to.eq(201);
        const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.includes('connect.sid'));
        cy.setCookie('connect.sid', sessionCookie.split(';')[0].split('=')[1]);
      });
  
      // Visit the diagram page with debug logging
      cy.visit('http://localhost:5173/diagram', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'log').as('consoleLog');
          cy.stub(win.console, 'error').as('consoleError');
        },
        timeout: 20000
      });
    });
  
    it('should load the diagram page - with debugging', () => {
      // Log the current URL to make sure we're on the right page
      cy.url().should('include', '/diagram');
  
      // Log any console errors that might occur
      cy.get('@consoleError').then((errorLog) => {
        if (errorLog.called) {
          cy.log('Console errors found:', errorLog.args);
        }
      });
  
      // Try to find the main container using data-testid
      cy.get('[data-testid="diagram-panel-group"]', { timeout: 20000 })
        .should('exist')
        .then($el => {
          cy.log('Main container found');
          cy.log('Container visibility:', $el.is(':visible'));
        });
  
      // Check for other main components
      cy.get('[data-testid="map-panel"]', { timeout: 20000 })
        .should('exist')
        .then(() => cy.log('Map panel found'));
  
      cy.get('[data-testid="diagram-panel"]', { timeout: 20000 })
        .should('exist')
        .then(() => cy.log('Diagram panel found'));
  
      // Look for React Flow container
      cy.get('.react-flow', { timeout: 20000 })
        .should('exist')
        .then(() => cy.log('React Flow container found'));
    });
  
    it('should verify basic interactions are possible', () => {
      // Wait for the page to be fully loaded
      cy.get('[data-testid="diagram-panel-group"]', { timeout: 20000 }).should('exist');
  
      // Check if resize handle exists and is interactive
      cy.get('[data-testid="resize-handle"]', { timeout: 20000 })
        .should('exist')
        .should('be.visible')
        .then(() => cy.log('Resize handle found'));
  
      // Check for React Flow nodes
      cy.get('.react-flow__node', { timeout: 20000 })
        .should('exist')
        .then(($nodes) => {
          cy.log(`Found ${$nodes.length} nodes`);
        });
    });
  });
  
  // UI Login test with debug logging
  describe('Diagram Page UI Login Flow', () => {
    const username = 'urban_planner';
    const password = 'urban_planner';
  
    it('should login and load diagram page', () => {
      cy.visit('http://localhost:5173/', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'log').as('consoleLog');
          cy.stub(win.console, 'error').as('consoleError');
        }
      });
  
      // Verify we're on the login page
      cy.url().should('eq', 'http://localhost:5173/');
      cy.log('On login page');
  
      // Perform login
      cy.get('input[name="username"]', { timeout: 20000 }).should('be.visible')
        .type(username)
        .then(() => cy.log('Username entered'));
        
      cy.get('input[name="password"]').should('be.visible')
        .type(password)
        .then(() => cy.log('Password entered'));
  
      cy.get('button[type="submit"]').click()
        .then(() => cy.log('Login button clicked'));
  
      // Navigate to diagram
      cy.visit('http://localhost:5173/diagram', { timeout: 20000 });
      cy.url().should('include', '/diagram');
  
      // Check for main components
      cy.get('[data-testid="diagram-panel-group"]', { timeout: 20000 })
        .should('exist')
        .then(() => cy.log('Main container found after login'));
    });
  });