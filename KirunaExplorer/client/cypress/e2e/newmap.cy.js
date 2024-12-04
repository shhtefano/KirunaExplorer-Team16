describe('Urban Planner - Select Existing Point or Area', () => {
    beforeEach(() => {
        cy.request({
            method: "POST",
            url: "http://localhost:3001/api/sessions",
            body: {
                username: "urban_planner",
                password: "urban_planner",
            },
        }).then((response) => {
            window.localStorage.setItem("auth_token", response.body.token);
        });

        // Visit the map page where the DrawMap component is rendered
        cy.visit('http://localhost:5173/areas');
    });

    it('should show areas in the right column and allow searching', () => {
        cy.get('input[placeholder="Search areas by name"]').type('Kiruna');
        cy.get('.form-check-label').contains('Kiruna Map').should('exist');
    });

    it('should toggle between markers and polygons view modes', () => {
        // Initially, it should show polygons view
        cy.get('button').contains('Switch View Mode: Markers').click();

        // Now, it should be in markers view mode
        cy.get('button').contains('Switch View Mode: Polygons').should('exist');
    });

    it('should select an area from the list and display it on the map', () => {
        cy.get('.form-check-input').first().check(); // Check the first area
        cy.get('.leaflet-interactive').should('exist'); // Ensure the area is visible on the map
    });

    it('should delete an existing area that is not Kiruna Map', () => {
        // Seleziona il primo checkbox che non è "Kiruna Map"
        cy.get('.form-check-label').not(':contains("Kiruna Map")').first().click(); // Seleziona il primo checkbox che non ha il testo "Kiruna Map"
    
        // Verifica che l'area selezionata sia visibile sulla mappa
        cy.get('.leaflet-interactive').should('exist');
    
        // Clicca il pulsante di eliminazione dell'area selezionata
        cy.get('button').contains('X').first().click();
    
        // Verifica che l'area selezionata sia stata rimossa dalla lista
        cy.get('.form-check-label').contains('Kiruna Map').should('exist'); // Assicurati che "Kiruna Map" sia ancora presente
        cy.get('.form-check-label').should('not.contain', 'Mock Area'); // Verifica che l'area mockata non esista più
    });
    

    it('should allow selecting an existing area and showing it on the map', () => {
        cy.get('.form-check-input').first().check(); // Select first area

        // Verify the corresponding polygon is visible on the map
        cy.get('.leaflet-interactive').should('exist');
    });

    it('should toggle select all areas', () => {
        // Click "Select all" checkbox
        cy.get('input[type="checkbox"]').check();

        // Verify all areas are selected
        cy.get('.form-check-input').each((checkbox) => {
            cy.wrap(checkbox).should('be.checked');
        });

        // Add wait for better synchronization
        cy.wait(500); // 500ms wait to allow for the changes to take effect

        // Click "Select all" again to deselect all
        cy.get('input[type="checkbox"]').uncheck();

        // Verify all areas are deselected
        cy.get('.form-check-input').each((checkbox) => {
            cy.wrap(checkbox).should('not.be.checked');
        });
    });
});
