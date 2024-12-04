describe('Documents Table', () => {
    it('should load and display documents in the table', () => {
        // Intercetta la richiesta API per i documenti
        cy.intercept('GET', '/api/document/list').as('getDocuments');

        // Visita la pagina
        cy.visit('/documents/list');

        //   // Aspetta che la richiesta sia completata
        cy.wait('@getDocuments');

        //   // Verifica che la tabella sia visibile
        cy.get('table').should('be.visible');

        //   // Verifica che la tabella abbia almeno una riga di documenti
        cy.get('table tbody tr').should('have.length.at.least', 1);
    });
});

describe('Documents Table - Filter by Language', () => {
    it('should filter documents by selected language', () => {
        cy.visit('/documents/list');
        cy.get('[data-cy="language-select"]').click(); // Usa data-cy per identificare l'elemento
        cy.get('[role="option"]').contains('English').click(); // Seleziona la lingua
        cy.get('table tbody tr').each((row) => {
            cy.wrap(row).should('contain.text', 'English'); // Verifica che ogni documento abbia la lingua selezionata
        });
    });
});
