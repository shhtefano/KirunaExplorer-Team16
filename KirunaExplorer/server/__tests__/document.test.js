import { describe, test, expect, jest, beforeAll, afterEach } from "@jest/globals";
import { db } from "../db/db.mjs";
import DocumentDAO from "../dao/document-dao.mjs"; // Assumendo che la tua funzione getDocumentByTitle sia in DocumentDAO

jest.mock('../db/db.mjs'); 

describe('Suite test for getDocumentByTitle function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun documento trovato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return null if no document is found', async () => {
        const document_id = 'some-title';

        // Simula che il documento non venga trovato
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessun documento trovato
        });

        await expect(documentDAO.getDocumentByTitle(document_id)).resolves.toBeNull();

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should return a document with stakeholders if found', async () => {
        const document_id = 'some-title';
        const mockRows = [
            {
                document_id: 1,
                document_title: 'Test Document',
                scale: '1:1000',
                issuance_date: '2024-01-01',
                language: 'EN',
                pages: 10,
                document_type: 'Invoice',
                document_description: 'Test description',
                stakeholder_name: 'John Doe'
            },
            {
                document_id: 1,
                document_title: 'Test Document',
                scale: '1:1000',
                issuance_date: '2024-01-01',
                language: 'EN',
                pages: 10,
                document_type: 'Invoice',
                document_description: 'Test description',
                stakeholder_name: 'Jane Doe'
            }
        ];

        // Simula la risposta con i dati di un documento e due stakeholder
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Documento trovato con due stakeholder
        });

        const expectedDocument = {
            document_id: 1,
            document_title: 'Test Document',
            scale: '1:1000',
            issuance_date: '2024-01-01',
            language: 'EN',
            pages: 10,
            document_type: 'Invoice',
            document_description: 'Test description',
            stakeholders: ['John Doe', 'Jane Doe']
        };

        await expect(documentDAO.getDocumentByTitle(document_id)).resolves.toEqual(expectedDocument);

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should reject if there is an error in the database query', async () => {
        const document_id = 'some-title';

        // Simula errore nella query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Error retrieving document")); // Errore nella query
        });

        await expect(documentDAO.getDocumentByTitle(document_id)).rejects.toThrow(
            "Errore durante il recupero del documento."
        );

        expect(db.all).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for getDocumentTypes function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun tipo trovato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return an empty array if no document types are found', async () => {
        // Simula nessun tipo di documento trovato
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessun tipo trovato
        });

        await expect(documentDAO.getDocumentTypes()).resolves.toEqual([]);

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should return a list of document types if found', async () => {
        const mockRows = [
            { type_name: 'Invoice' },
            { type_name: 'Report' },
            { type_name: 'Letter' }
        ];

        // Simula la risposta con i tipi di documento trovati
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Tipi di documento trovati
        });

        await expect(documentDAO.getDocumentTypes()).resolves.toEqual(mockRows);

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should reject if there is an error in the database query', async () => {
        // Simula errore nella query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Error retrieving document types")); // Errore nella query
        });

        await expect(documentDAO.getDocumentTypes()).rejects.toThrow(
            "Error retrieving document types."
        );

        expect(db.all).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for getAreaIdByDocumentId function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.get per simulare la risposta del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            callback(null, {}); // Valore predefinito: nessun errore e nessun area_id trovato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return the area_id if found', async () => {
        const document_id = 1;
        const mockRow = { area_id: 123 };

        // Simula la risposta con un area_id trovato
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRow); // area_id trovato
        });

        await expect(documentDAO.getAreaIdByDocumentId(document_id)).resolves.toEqual(mockRow.area_id);

        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test('should reject if no area is found for the given document_id', async () => {
        const document_id = 1;

        // Simula nessuna area trovata per il document_id
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun risultato trovato
        });

        await expect(documentDAO.getAreaIdByDocumentId(document_id)).rejects.toThrow(
            "Nessuna area associata a questo document_id"
        );

        expect(db.get).toHaveBeenCalledTimes(1);
    });

    test('should reject if there is an error in the database query', async () => {
        const document_id = 1;

        // Simula errore nella query
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Error retrieving area_id")); // Errore nella query
        });

        await expect(documentDAO.getAreaIdByDocumentId(document_id)).rejects.toThrow(
            "Errore durante il recupero dell'area_id."
        );

        expect(db.get).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for deleteConnection function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.run per simulare la risposta del database
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            callback(null); // Valore predefinito: nessun errore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reject if there is an error during the deletion process', async () => {
        const doc1_id = 1;
        const doc2_id = 2;
        const connection_type = 'link';

        // Simula errore durante l'eliminazione
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante la cancellazione delle connessioni")); // Errore nella query
        });

        await expect(documentDAO.deleteConnection(doc1_id, doc2_id, connection_type)).rejects.toThrow(
            "Errore durante la cancellazione delle connessioni"
        );

        expect(db.run).toHaveBeenCalledTimes(1);
    });

    test('should reject if connection_type is empty string', async () => {
        const doc1_id = 1;
        const doc2_id = 2;
        const connection_type = '';

        // Simula errore con connection_type vuoto
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante la cancellazione delle connessioni")); // Errore
        });

        await expect(documentDAO.deleteConnection(doc1_id, doc2_id, connection_type)).rejects.toThrow(
            "Errore durante la cancellazione delle connessioni"
        );

        expect(db.run).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for getConnectionsByDocumentTitle function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun risultato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should reject with an error if query fails', async () => {
        const title = 'Sample Document';

        // Simula errore durante il recupero delle connessioni
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero delle connessioni")); // Errore nella query
        });

        await expect(documentDAO.getConnectionsByDocumentTitle(title)).rejects.toThrow(
            "Errore durante il recupero delle connessioni."
        );

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should return an empty array if no connections are found', async () => {
        const title = 'Sample Document';

        // Simula il caso in cui non vengano trovate connessioni
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessuna connessione trovata
        });

        await expect(documentDAO.getConnectionsByDocumentTitle(title)).resolves.toEqual([]);

        expect(db.all).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for getDocumentPosition function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun risultato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return document position data successfully', async () => {
        const document_id = 1;

        // Simula la risposta del database con dati di esempio
        const mockRows = [
            {
                document_id: 1,
                document_title: 'Sample Document',
                scale: '1:100',
                issuance_date: '2024-12-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Sample description',
                area_name: 'Area 1',
                lat: 40.7128,
                long: -74.0060,
                sub_area_id: 1,
                n_order: 1,
            },
            {
                document_id: 1,
                document_title: 'Sample Document',
                scale: '1:100',
                issuance_date: '2024-12-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Sample description',
                area_name: 'Area 2',
                lat: 34.0522,
                long: -118.2437,
                sub_area_id: 2,
                n_order: 2,
            },
        ];

        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Dati trovati
        });

        const result = await documentDAO.getDocumentPosition(document_id);

        // Verifica che i dati del documento siano correttamente restituiti
        expect(result.document_id).toBe(1);
        expect(result.document_title).toBe('Sample Document');
        expect(result.coordinates).toEqual([
            [
                { lat: 40.7128, lng: -74.0060 },
            ],
            [
                { lat: 34.0522, lng: -118.2437 },
            ],
        ]);
    });

    test('should return null if no document found', async () => {
        const document_id = 999;

        // Simula il caso in cui non vengano trovati documenti
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessun documento trovato
        });

        const result = await documentDAO.getDocumentPosition(document_id);

        // Verifica che venga restituito null
        expect(result).toBeNull();
    });

    test('should reject with an error if query fails', async () => {
        const document_id = 1;

        // Simula errore durante la query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero della posizione del documento")); // Errore nella query
        });

        await expect(documentDAO.getDocumentPosition(document_id)).rejects.toThrow(
            "Errore durante il recupero della posizione del documento"
        );
    });

    test('should handle empty sub_area_id correctly', async () => {
        const document_id = 1;

        // Simula dati con sub_area_id vuoto
        const mockRows = [
            {
                document_id: 1,
                document_title: 'Sample Document',
                scale: '1:100',
                issuance_date: '2024-12-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Sample description',
                area_name: 'Area 1',
                lat: 40.7128,
                long: -74.0060,
                sub_area_id: 0, // Sub_area_id vuoto
                n_order: 1,
            },
        ];

        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Dati trovati
        });

        const result = await documentDAO.getDocumentPosition(document_id);

        // Verifica che le coordinate siano correttamente raggruppate anche con sub_area_id vuoto
        expect(result.coordinates).toEqual([
            [
                { lat: 40.7128, lng: -74.0060 },
            ],
        ]);
    });
});


describe('Suite test for getAreaCoordinates function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun risultato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return area coordinates successfully', async () => {
        const area_id = 1;

        // Simula la risposta del database con dati di esempio
        const mockRows = [
            {
                lat: 40.7128,
                long: -74.0060,
                sub_area_id: 1,
                n_order: 1,
            },
            {
                lat: 34.0522,
                long: -118.2437,
                sub_area_id: 2,
                n_order: 2,
            },
        ];

        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Dati trovati
        });

        const result = await documentDAO.getAreaCoordinates(area_id);

        // Verifica che le coordinate siano correttamente restituite
        expect(result).toEqual([
            [
                { lat: 40.7128, lng: -74.0060 },
            ],
            [
                { lat: 34.0522, lng: -118.2437 },
            ],
        ]);
    });

    test('should return null if no area found', async () => {
        const area_id = 999;

        // Simula il caso in cui non vengano trovate coordinate per l'area
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessuna area trovata
        });

        const result = await documentDAO.getAreaCoordinates(area_id);

        // Verifica che venga restituito null
        expect(result).toBeNull();
    });

    test('should reject with an error if query fails', async () => {
        const area_id = 1;

        // Simula errore durante la query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero delle coordinate dell'area")); // Errore nella query
        });

        await expect(documentDAO.getAreaCoordinates(area_id)).rejects.toThrow(
            "Errore durante il recupero delle coordinate dell'area"
        );
    });

    test('should handle empty sub_area_id correctly', async () => {
        const area_id = 1;

        // Simula dati con sub_area_id vuoto
        const mockRows = [
            {
                lat: 40.7128,
                long: -74.0060,
                sub_area_id: 0, // Sub_area_id vuoto
                n_order: 1,
            },
        ];

        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Dati trovati
        });

        const result = await documentDAO.getAreaCoordinates(area_id);

        // Verifica che le coordinate siano correttamente raggruppate anche con sub_area_id vuoto
        expect(result).toEqual([
            [
                { lat: 40.7128, lng: -74.0060 },
            ],
        ]);
    });
});

describe('Suite test for getStakeholders function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, []); // Valore predefinito: nessun errore e nessun risultato
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return stakeholders successfully', async () => {
        // Simula la risposta del database con dati di esempio
        const mockRows = [
            { stakeholder_name: 'John Doe' },
            { stakeholder_name: 'Jane Smith' },
        ];

        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Dati trovati
        });

        const result = await documentDAO.getStakeholders();

        // Verifica che i nomi degli stakeholder siano correttamente restituiti
        expect(result).toEqual(mockRows);
    });

    test('should return an empty array if no stakeholders found', async () => {
        // Simula il caso in cui non vengano trovati stakeholder
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessun stakeholder trovato
        });

        const result = await documentDAO.getStakeholders();

        // Verifica che venga restituito un array vuoto se non ci sono stakeholder
        expect(result).toEqual([]);
    });

    test('should call the query to retrieve stakeholders', async () => {
        const mockRows = [
            { stakeholder_name: 'John Doe' },
            { stakeholder_name: 'Jane Smith' },
        ];
    
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Simula una risposta con risultati
        });
    
        await documentDAO.getStakeholders();
    
        // Verifica che db.all sia stato chiamato con la query corretta
        expect(db.all).toHaveBeenCalledWith(
            'SELECT stakeholder_name FROM Stakeholders',
            [],
            expect.any(Function) // Verifica che la callback sia stata passata
        );
    });
    

    test('should reject with a database connection error', async () => {
        const mockError = new Error("Errore di connessione al database");
    
        // Simula un errore di connessione
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(mockError, null); // Errore di connessione
        });
    
        await expect(documentDAO.getStakeholders()).rejects.toThrow(
            "Errore durante il recupero dei documenti."
        );
    
        // Verifica che il messaggio di errore sia quello atteso
        expect(db.all).toHaveBeenCalledTimes(1);
    });
    
    test('should return multiple stakeholders correctly', async () => {
        const mockRows = [
            { stakeholder_name: 'Alice Cooper' },
            { stakeholder_name: 'Bob Martin' },
            { stakeholder_name: 'Charlie Brown' },
        ];
    
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockRows); // Simula una risposta con più stakeholder
        });
    
        const result = await documentDAO.getStakeholders();
    
        // Verifica che venga restituito un array con più stakeholder
        expect(result).toEqual(mockRows);
        expect(result).toHaveLength(3); // Verifica che ci siano 3 stakeholder
    }); 
});

describe('Suite test for util_getStakeholdersIDs function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.get per simulare la risposta del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            callback(null, { stakeholder_id: 1 }); // Mock di una risposta di esempio
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return empty array if no stakeholder IDs found', async () => {
        const stakeholders = ['NonExistentStakeholder'];

        // Simula nessun risultato trovato per lo stakeholder
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun ID trovato
        });

        const result = await documentDAO.util_getStakeholdersIDs(stakeholders);

        // Verifica che venga restituito un array vuoto
        expect(result).toEqual([]);
    });

    test('should handle errors during database queries', async () => {
        const stakeholders = ['John Doe', 'Jane Smith'];

        // Simula errore durante la query
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero dello stakeholder")); // Errore nella query
        });

        await expect(documentDAO.util_getStakeholdersIDs(stakeholders)).rejects.toThrow(
            "Errore durante il recupero dello stakeholder"
        );
    });
});


describe('Suite test for util_insertStakeholder function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.get per simulare la risposta del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            callback(null, { stakeholder_id: 1 }); // Mock di una risposta di esempio
        });

        // Mock della funzione db.run per simulare l'inserimento di un record
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            callback(null, { lastID: 2 }); // Mock di un inserimento con lastID 2
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return existing stakeholder if already exists', async () => {
        const stakeholderName = 'John Doe';

        // Simula che lo stakeholder esista già
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { stakeholder_id: 1 }); // Simula il recupero di un record esistente
        });

        const result = await documentDAO.util_insertStakeholder(stakeholderName);

        // Verifica che venga restituito lo stakeholder esistente
        expect(result).toEqual({
            stakeholder_id: 1,
            stakeholder_name: 'John Doe'
        });
    });

    test('should handle errors when checking existing stakeholder', async () => {
        const stakeholderName = 'John Doe';

        // Simula errore nella query di selezione
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante la verifica dello stakeholder"));
        });

        await expect(documentDAO.util_insertStakeholder(stakeholderName)).rejects.toThrow(
            "Errore durante la verifica dello stakeholder"
        );
    });

    test('should handle errors when inserting new stakeholder', async () => {
        const stakeholderName = 'Alice Johnson';

        // Simula che lo stakeholder non esista
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun record trovato
        });

        // Simula errore nell'inserimento del nuovo record
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante l'inserimento dello stakeholder"));
        });

        await expect(documentDAO.util_insertStakeholder(stakeholderName)).rejects.toThrow(
            "Errore durante l'inserimento dello stakeholder"
        );
    });
});

describe('Suite test for linkDocuments function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni db.get e db.run per simulare le risposte del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (query.includes('SELECT * FROM Documents')) {
                if (params[0] === 1) {
                    callback(null, { document_id: 1, document_title: 'Document 1' });
                } else if (params[0] === 2) {
                    callback(null, { document_id: 2, document_title: 'Document 2' });
                } else {
                    callback(null, null); // Simula che non ci sia un nodo per altri ID
                }
            } else if (query.includes('SELECT * FROM Connections')) {
                // Simula che non ci siano connessioni duplicate
                callback(null, null);
            }
        });

        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            // Simula l'inserimento di una connessione
            if (query.includes('INSERT INTO Connections')) {
                callback(null);
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully create a new connection', async () => {
        const result = await documentDAO.linkDocuments(1, 2, 'reference');

        // Verifica che la connessione sia stata creata correttamente
        expect(result).toEqual({
            parent_id: 1,
            children_id: 2,
            connection_type: 'reference',
        });

        expect(db.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO Connections'),
            [1, 2, 'reference'],
            expect.any(Function)
        );
    });

    test('should throw an error if parent node does not exist', async () => {
        await expect(documentDAO.linkDocuments(99, 2, 'reference')).rejects.toThrow(
            "Parent Node not found! Please verify the ID."
        );
    });

    test('should throw an error if child node does not exist', async () => {
        await expect(documentDAO.linkDocuments(1, 99, 'reference')).rejects.toThrow(
            "Child Node not found! Please double-check the ID."
        );
    });

    test('should throw an error if there is a failure during connection insertion', async () => {
        // Mock per simulare un errore durante l'inserimento della connessione
        jest.spyOn(db, 'run').mockImplementationOnce((query, params, callback) => {
            callback(new Error("Failed to insert connection"));
        });

        await expect(documentDAO.linkDocuments(1, 2, 'reference')).rejects.toThrow(
            "Failed to insert connection: Failed to insert connection"
        );
    });

test("Error checking connection existence", async () => {
    jest.spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 1 }); // Parent node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 2 }); // Child node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Error checking existing connection")); // Simulates error
        });

    await expect(documentDAO.linkDocuments(1, 2, "related"))
        .rejects.toThrow("Error checking existing connection");

    db.get.mockRestore();
});

test("Error checking reverse connection existence", async () => {
    jest.spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 1 }); // Parent node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 2 }); // Child node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // No existing connection
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Error checking reverse connection")); // Simulates error
        });

    await expect(documentDAO.linkDocuments(1, 2, "related"))
        .rejects.toThrow("Error checking reverse connection");

    db.get.mockRestore();
});

test("Successful creation of a link between documents with a different connection type", async () => {
    jest.spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 1 }); // Parent node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 2 }); // Child node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // No existing connection
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // No reverse connection exists
        });

    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        callback(null); // Simulates link insertion
    });

    const result = await documentDAO.linkDocuments(1, 2, "differentType");
    expect(result).toEqual({
        parent_id: 1,
        children_id: 2,
        connection_type: "differentType",
    });

    db.get.mockRestore();
    db.run.mockRestore();
});
});

describe('Suite test for getDocuments function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, [
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    stakeholder_name: 'Stakeholder A',
                },
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    stakeholder_name: 'Stakeholder B',
                },
                {
                    document_id: 2,
                    document_title: 'Document 2',
                    scale: '1:500',
                    issuance_date: '2023-02-01',
                    language: 'IT',
                    pages: 20,
                    document_type: 'Manual',
                    document_description: 'Description of document 2',
                    stakeholder_name: 'Stakeholder C',
                },
            ]); // Simula una risposta di più righe
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return documents with stakeholders grouped correctly', async () => {
        const result = await documentDAO.getDocuments();

        // Verifica che il risultato sia un array con i documenti raggruppati per ID
        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document 1',
                scale: '1:1000',
                issuance_date: '2023-01-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Description of document 1',
                stakeholders: ['Stakeholder A', 'Stakeholder B'],
            },
            {
                document_id: 2,
                document_title: 'Document 2',
                scale: '1:500',
                issuance_date: '2023-02-01',
                language: 'IT',
                pages: 20,
                document_type: 'Manual',
                document_description: 'Description of document 2',
                stakeholders: ['Stakeholder C'],
            }
        ]);
    });

    test('should handle empty result set', async () => {
        // Mock della query per simulare nessun risultato
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessuna riga restituita
        });

        const result = await documentDAO.getDocuments();

        // Verifica che il risultato sia un array vuoto
        expect(result).toEqual([]);
    });

    test('should handle error when querying documents', async () => {
        // Simula un errore durante la query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero dei documenti"));
        });

        await expect(documentDAO.getDocuments()).rejects.toThrow(
            "Errore durante il recupero dei documenti"
        );
    });

    test('should return documents with a single stakeholder', async () => {
        // Simula una risposta con un solo stakeholder per ogni documento
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, [
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    stakeholder_name: 'Stakeholder A',
                },
                {
                    document_id: 2,
                    document_title: 'Document 2',
                    scale: '1:500',
                    issuance_date: '2023-02-01',
                    language: 'IT',
                    pages: 20,
                    document_type: 'Manual',
                    document_description: 'Description of document 2',
                    stakeholder_name: 'Stakeholder B',
                },
            ]);
        });

        const result = await documentDAO.getDocuments();

        // Verifica che i documenti siano restituiti con un solo stakeholder per ciascuno
        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document 1',
                scale: '1:1000',
                issuance_date: '2023-01-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Description of document 1',
                stakeholders: ['Stakeholder A'],
            },
            {
                document_id: 2,
                document_title: 'Document 2',
                scale: '1:500',
                issuance_date: '2023-02-01',
                language: 'IT',
                pages: 20,
                document_type: 'Manual',
                document_description: 'Description of document 2',
                stakeholders: ['Stakeholder B'],
            }
        ]);
    });

    test('should handle multiple stakeholders for the same document', async () => {
        const result = await documentDAO.getDocuments();

        // Verifica che il risultato contenga correttamente più stakeholder per lo stesso documento
        expect(result[0].stakeholders).toContain('Stakeholder A');
        expect(result[0].stakeholders).toContain('Stakeholder B');
        expect(result[1].stakeholders).toContain('Stakeholder C');
    });
});

describe('Suite test for getDocumentsGeo function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock della funzione db.all per simulare la risposta del database
        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            callback(null, [
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    area_id: 1,
                    long: 12.34,
                    lat: 56.78,
                    area_name: 'Area A',
                    stakeholder_name: 'Stakeholder A',
                },
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    area_id: 2,
                    long: 98.76,
                    lat: 54.32,
                    area_name: 'Area B',
                    stakeholder_name: 'Stakeholder A',
                },
                {
                    document_id: 2,
                    document_title: 'Document 2',
                    scale: '1:500',
                    issuance_date: '2023-02-01',
                    language: 'IT',
                    pages: 20,
                    document_type: 'Manual',
                    document_description: 'Description of document 2',
                    area_id: 1,
                    long: 22.22,
                    lat: 33.33,
                    area_name: 'Area A',
                    stakeholder_name: 'Stakeholder B',
                },
            ]); // Simula una risposta di più righe
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return documents with geolocations and stakeholders grouped correctly', async () => {
        const result = await documentDAO.getDocumentsGeo();

        // Verifica che il risultato contenga i documenti con geolocalizzazioni e stakeholder correttamente raggruppati
        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document 1',
                scale: '1:1000',
                issuance_date: '2023-01-01',
                language: 'EN',
                pages: 10,
                document_type: 'Report',
                document_description: 'Description of document 1',
                stakeholders: ['Stakeholder A'],
                geolocations: [
                    { area_name: 'Area A', coordinates: [{ long: 12.34, lat: 56.78 }] },
                    { area_name: 'Area B', coordinates: [{ long: 98.76, lat: 54.32 }] }
                ]
            },
            {
                document_id: 2,
                document_title: 'Document 2',
                scale: '1:500',
                issuance_date: '2023-02-01',
                language: 'IT',
                pages: 20,
                document_type: 'Manual',
                document_description: 'Description of document 2',
                stakeholders: ['Stakeholder B'],
                geolocations: [
                    { area_name: 'Area A', coordinates: [{ long: 22.22, lat: 33.33 }] }
                ]
            }
        ]);
    });

    test('should handle empty result set', async () => {
        // Mock della query per simulare nessun risultato
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // Nessuna riga restituita
        });

        const result = await documentDAO.getDocumentsGeo();

        // Verifica che il risultato sia un array vuoto
        expect(result).toEqual([]);
    });

    test('should handle error when querying documents with geolocation', async () => {
        // Simula un errore durante la query
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero dei documenti con geolocalizzazione"));
        });

        await expect(documentDAO.getDocumentsGeo()).rejects.toThrow(
            "Errore durante il recupero dei documenti."
        );
    });

    test('should handle geolocations with point-based documents correctly', async () => {
        // Simula la risposta con area_name "Point-Based Documents"
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, [
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    area_id: 1,
                    long: 12.34,
                    lat: 56.78,
                    area_name: 'Point-Based Documents',
                    stakeholder_name: 'Stakeholder A',
                },
                {
                    document_id: 1,
                    document_title: 'Document 1',
                    scale: '1:1000',
                    issuance_date: '2023-01-01',
                    language: 'EN',
                    pages: 10,
                    document_type: 'Report',
                    document_description: 'Description of document 1',
                    area_id: 2,
                    long: 98.76,
                    lat: 54.32,
                    area_name: 'Area B',
                    stakeholder_name: 'Stakeholder A',
                }
            ]);
        });

        const result = await documentDAO.getDocumentsGeo();

        // Verifica che la geolocalizzazione per "Point-Based Documents" contenga solo una coordinata
        expect(result[0].geolocations).toEqual([
            { area_name: 'Point-Based Documents', coordinates: [{ long: 12.34, lat: 56.78 }] },
            { area_name: 'Area B', coordinates: [{ long: 98.76, lat: 54.32 }] }
        ]);
    });

    test('should handle multiple geolocations for a document correctly', async () => {
        const result = await documentDAO.getDocumentsGeo();

        // Verifica che il documento abbia più geolocalizzazioni
        expect(result[0].geolocations).toHaveLength(2); // Due geolocalizzazioni per il documento 1
        expect(result[1].geolocations).toHaveLength(1); // Una geolocalizzazione per il documento 2
    });

    test('should throw an error if the database query fails', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database query failed"), null);
        });
    
        await expect(documentDAO.getDocumentsGeo()).rejects.toThrow("Errore durante il recupero dei documenti");
    
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should throw an error if there is an issue retrieving documents', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero dei documenti"), null);
        });

        await expect(documentDAO.getDocumentsGeo()).rejects.toThrow("Errore durante il recupero dei documenti");
        expect(db.all).toHaveBeenCalledTimes(1);
    });

});   

describe('Suite test for linkDocuments function', () => { 
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni db.get e db.run per simulare le risposte del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (query.includes('SELECT * FROM Documents')) {
                if (params[0] === 1) {
                    callback(null, { document_id: 1, document_title: 'Document 1' });
                } else if (params[0] === 2) {
                    callback(null, { document_id: 2, document_title: 'Document 2' });
                } else {
                    callback(null, null); // Simula che non ci sia un nodo per altri ID
                }
            } else if (query.includes('SELECT * FROM Connections')) {
                // Simula che non ci siano connessioni duplicate
                callback(null, null);
            }
        });

        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            // Simula l'inserimento di una connessione
            if (query.includes('INSERT INTO Connections')) {
                callback(null);
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if parent node does not exist', async () => {
        await expect(documentDAO.linkDocuments(99, 2, 'reference')).rejects.toThrow(
            "Parent Node not found! Please verify the ID."
        );
    });

    test('should throw an error if child node does not exist', async () => {
        await expect(documentDAO.linkDocuments(1, 99, 'reference')).rejects.toThrow(
            "Child Node not found! Please double-check the ID."
        );
    });



test("Error checking connection existence", async () => {
    jest.spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 1 }); // Parent node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 2 }); // Child node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Error checking existing connection")); // Simulates error
        });

    await expect(documentDAO.linkDocuments(1, 2, "related"))
        .rejects.toThrow("Error checking existing connection");

    db.get.mockRestore();
});

test("Error checking reverse connection existence", async () => {
    jest.spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 1 }); // Parent node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, { document_id: 2 }); // Child node exists
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(null, null); // No existing connection
        })
        .mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Error checking reverse connection")); // Simulates error
        });

    await expect(documentDAO.linkDocuments(1, 2, "related"))
        .rejects.toThrow("Error checking reverse connection");

    db.get.mockRestore();
});
});

describe('Suite test for updatePointCoordinates function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (callback) callback(null, null); // Valore predefinito: nessun risultato
        });
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null); // Valore predefinito: nessun errore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('should update coordinates when area_id is not 1', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { area_id: 2 });
        });
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(null); // Simula un aggiornamento riuscito
        });
    
        const result = await documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat);
    
        expect(result).toEqual({
            area_id: 2,
            long: mockLong,
            lat: mockLat,
        });
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
        expect(db.run).toHaveBeenCalledWith(expect.any(String), [mockLong, mockLat, 2], expect.any(Function));
    });
    test('should create a new area_id and update the document when area_id is 1', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get
            .mockImplementationOnce((query, params, callback) => {
                callback(null, { area_id: 1 }); // Primo get: recupera area_id
            })
            .mockImplementationOnce((query, params, callback) => {
                callback(null, { maxId: 5 }); // Secondo get: recupera il max area_id
            });
    
        db.run.mockImplementation((query, params, callback) => {
            callback(null); // Simula un aggiornamento riuscito
        });
    
        const result = await documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat);
    
        expect(result).toEqual({
            area_id: 6,
            document_id: mockDocumentId,
        });
    
        expect(db.get).toHaveBeenCalledTimes(2);
        expect(db.run).toHaveBeenCalledTimes(2);
    });
    test('should reject with an error when no area_id is found for the given document_id', async () => {
        const mockDocumentId = 1;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun risultato trovato
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, 10.5, 20.5)).rejects.toThrow(
            "Nessun area_id trovato per il document_id fornito."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
    });
    test('should reject with an error when an error occurs while retrieving area_id', async () => {
        const mockDocumentId = 1;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database error"));
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, 10.5, 20.5)).rejects.toThrow(
            "Errore durante il recupero dell'area_id."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
    });
    test('should reject with an error when updating coordinates in Geolocation fails', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { area_id: 2 });
        });
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Update error"));
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat)).rejects.toThrow(
            "Errore durante l'aggiornamento delle coordinate."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
        expect(db.run).toHaveBeenCalledWith(expect.any(String), [mockLong, mockLat, 2], expect.any(Function));
    });
    

});

describe('Suite test for updatePointCoordinates function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (callback) callback(null, null); // Valore predefinito: nessun risultato
        });
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null); // Valore predefinito: nessun errore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('should update coordinates when area_id is not 1', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { area_id: 2 });
        });
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(null); // Simula un aggiornamento riuscito
        });
    
        const result = await documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat);
    
        expect(result).toEqual({
            area_id: 2,
            long: mockLong,
            lat: mockLat,
        });
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
        expect(db.run).toHaveBeenCalledWith(expect.any(String), [mockLong, mockLat, 2], expect.any(Function));
    });
    test('should create a new area_id and update the document when area_id is 1', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get
            .mockImplementationOnce((query, params, callback) => {
                callback(null, { area_id: 1 }); // Primo get: recupera area_id
            })
            .mockImplementationOnce((query, params, callback) => {
                callback(null, { maxId: 5 }); // Secondo get: recupera il max area_id
            });
    
        db.run.mockImplementation((query, params, callback) => {
            callback(null); // Simula un aggiornamento riuscito
        });
    
        const result = await documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat);
    
        expect(result).toEqual({
            area_id: 6,
            document_id: mockDocumentId,
        });
    
        expect(db.get).toHaveBeenCalledTimes(2);
        expect(db.run).toHaveBeenCalledTimes(2);
    });
    test('should reject with an error when no area_id is found for the given document_id', async () => {
        const mockDocumentId = 1;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun risultato trovato
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, 10.5, 20.5)).rejects.toThrow(
            "Nessun area_id trovato per il document_id fornito."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
    });
    test('should reject with an error when an error occurs while retrieving area_id', async () => {
        const mockDocumentId = 1;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database error"));
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, 10.5, 20.5)).rejects.toThrow(
            "Errore durante il recupero dell'area_id."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
    });
    test('should reject with an error when updating coordinates in Geolocation fails', async () => {
        const mockDocumentId = 1;
        const mockLong = 10.5;
        const mockLat = 20.5;
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { area_id: 2 });
        });
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Update error"));
        });
    
        await expect(documentDAO.updatePointCoordinates(mockDocumentId, mockLong, mockLat)).rejects.toThrow(
            "Errore durante l'aggiornamento delle coordinate."
        );
    
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockDocumentId], expect.any(Function));
        expect(db.run).toHaveBeenCalledWith(expect.any(String), [mockLong, mockLat, 2], expect.any(Function));
    });
    

});

describe('Suite test for updateDocumentArea function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (callback) callback(null, null); // Valore predefinito: nessun risultato
        });
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null); // Valore predefinito: nessun errore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('should successfully update the area of a document', async () => {
        const mockDocumentId = 1;
        const mockAreaId = 5;

        db.run.mockImplementationOnce((query, params, callback) => {
            callback(null); // Simula un aggiornamento riuscito
        });

        const result = await documentDAO.updateDocumentArea(mockDocumentId, mockAreaId);

        expect(result).toEqual({
            area_id: mockAreaId,
            document_id: mockDocumentId,
        });

        expect(db.run).toHaveBeenCalledWith(
            expect.any(String),
            [mockAreaId, mockDocumentId],
            expect.any(Function)
        );
    });

    // Test 2: Errore durante l'aggiornamento dell'area
    test('should reject with an error when updating the area fails', async () => {
        const mockDocumentId = 1;
        const mockAreaId = 5;

        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database error")); // Simula un errore
        });

        await expect(documentDAO.updateDocumentArea(mockDocumentId, mockAreaId)).rejects.toThrow(
            "Errore durante l'aggiornamento delle coordinate."
        );

        expect(db.run).toHaveBeenCalledWith(
            expect.any(String),
            [mockAreaId, mockDocumentId],
            expect.any(Function)
        );
    });

    test('should correctly update the area of an existing document', async () => {
        const mockDocumentId = 1;
        const mockAreaId = 3;

        db.run
            .mockImplementationOnce((query, params, callback) => {
                callback(null); // Simula l'aggiornamento riuscito
            })
            .mockImplementationOnce((query, params, callback) => {
                callback(null, [{ area_name: "Existing Area" }]); // Simula l'area trovata
            });

        const result = await documentDAO.updateDocumentArea(mockDocumentId, mockAreaId);

        expect(result).toEqual({
            area_id: mockAreaId,
            document_id: mockDocumentId
        });

        expect(db.run).toHaveBeenCalledTimes(2);
    });

    // Test 9: Verifica che l'area venga eliminata solo se il nome dell'area è "Point-Based Documents"
    test('should not delete anything if the area name is not "Point-Based Documents"', async () => {
        const mockDocumentId = 1;
        const mockAreaId = 2;

        db.run
            .mockImplementationOnce((query, params, callback) => {
                callback(null); // Aggiornamento riuscito
            })
            .mockImplementationOnce((query, params, callback) => {
                callback(null, [{ area_name: "Some Other Area" }]); // Nome area diverso
            });

        const result = await documentDAO.updateDocumentArea(mockDocumentId, mockAreaId);

        expect(result).toEqual({
            area_id: mockAreaId,
            document_id: mockDocumentId
        });

        expect(db.run).toHaveBeenCalledTimes(2);
    });

    // Test 10: Verifica che venga restituito l'errore corretto quando il DB non risponde
    test('should reject with an error if database query fails', async () => {
        const mockDocumentId = 1;
        const mockAreaId = 5;

        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database failure")); // Simula errore DB
        });

        await expect(documentDAO.updateDocumentArea(mockDocumentId, mockAreaId)).rejects.toThrow(
            "Errore durante l'aggiornamento delle coordinate."
        );

        expect(db.run).toHaveBeenCalledTimes(2); // Una sola chiamata a db.run
    });

});

describe('Suite test for addDocumentType function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        // Mock delle funzioni del database
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (callback) callback(null, null); // Valore predefinito: nessun risultato
        });
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null); // Valore predefinito: nessun errore
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('should reject if the document type already exists', async () => {
        const mockTypeName = 'Invoice';

        // Mock della risposta di db.get per simulare che il tipo esista già
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { type_name: mockTypeName }); // Tipo già esistente
        });

        await expect(documentDAO.addDocumentType(mockTypeName)).rejects.toThrow(
            "Document type already exists"
        );

        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalledTimes(0);
    });

    // Test 3: Verifica che venga restituito un errore se si verifica un problema durante il controllo del tipo
    test('should reject with an error if checking document type fails', async () => {
        const mockTypeName = 'Invoice';

        // Simula errore nel controllo del tipo
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Error checking document type")); // Errore nel controllo
        });

        await expect(documentDAO.addDocumentType(mockTypeName)).rejects.toThrow(
            "Error checking document type."
        );

        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalledTimes(0);
    });

    // Test 4: Verifica che venga restituito un errore se si verifica un problema durante l'inserimento
    test('should reject with an error if adding document type fails', async () => {
        const mockTypeName = 'Invoice';

        // Mock della risposta di db.get per simulare che il tipo non esista già
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // Nessun tipo esistente
        });

        // Simula errore nell'inserimento del nuovo tipo
        db.run.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Error adding document type")); // Errore nell'inserimento
        });

        await expect(documentDAO.addDocumentType(mockTypeName)).rejects.toThrow(
            "Error adding document type."
        );

        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalledTimes(1);
    });

});