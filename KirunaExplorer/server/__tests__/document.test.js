import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import { db } from "../db/db.mjs";
import DocumentDAO from "../dao/document-dao.mjs";

jest.mock('../db/db.mjs'); 

describe('Suite test for getDocuments function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should retrieve documents successfully', async () => {
        const mockDocuments = [
            { id: 1, title: 'Document 1', description: 'Description 1' },
            { id: 2, title: 'Document 2', description: 'Description 2' }
        ];

        db.all.mockImplementation((query, params, callback) => {
            callback(null, mockDocuments);
        });

        const documents = await documentDAO.getDocuments();

        expect(documents).toEqual(mockDocuments);
        expect(db.all).toHaveBeenCalledTimes(1); 
    });

    test('should throw an error if retrieving documents fails', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(new Error('Errore durante il recupero dei documenti.'), null);
        });

        await expect(documentDAO.getDocuments()).rejects.toThrow('Errore durante il recupero dei documenti.');
        expect(db.all).toHaveBeenCalledTimes(1); 
    });

    test('should return an empty array if no documents are found', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(null, []); 
        });

        const documents = await documentDAO.getDocuments();
        expect(documents).toEqual([]); 
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should handle documents with null fields', async () => {
        const mockDocuments = [
            { id: 1, title: null, description: 'Description 1' },
            { id: 2, title: 'Document 2', description: null }
        ];

        db.all.mockImplementation((query, params, callback) => {
            callback(null, mockDocuments);
        });

        const documents = await documentDAO.getDocuments();
        expect(documents).toEqual(mockDocuments);
        expect(documents[0].title).toBeNull(); 
        expect(documents[1].description).toBeNull(); 
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should call db.all with the correct query', async () => {
        const expectedQuery = `
            SELECT *
            FROM Documents
        `;

        db.all.mockImplementation((query, params, callback) => {
            callback(null, []); 
        });

        await documentDAO.getDocuments();
        expect(db.all).toHaveBeenCalledWith(expectedQuery, expect.any(Array), expect.any(Function));
    });

    test('should return an empty array if no rows are returned by the query', async () => {
        db.all.mockImplementation((query, params, callback) => {
            callback(null, undefined); 
        });

        const documents = await documentDAO.getDocuments();
        expect(documents).toEqual(undefined); 
        expect(db.all).toHaveBeenCalledTimes(1);
    });
});

describe('Suite test for getDocumentsGeo function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        jest.spyOn(db, 'all').mockImplementation((query, params, callback) => {
            const mockData = [
                {
                    document_id: 1,
                    document_title: 'Document Title 1',
                    stakeholder: 'Stakeholder 1',
                    scale: 'Scale 1',
                    issuance_date: '2023-01-01',
                    language: 'English',
                    pages: 10,
                    document_type: 'Type 1',
                    document_description: 'Description 1',
                    area_id: 1,
                    long: 12.34,
                    lat: 56.78,
                    area_name: 'Area 1'
                },
                {
                    document_id: 1,
                    document_title: 'Document Title 1',
                    stakeholder: 'Stakeholder 1',
                    scale: 'Scale 1',
                    issuance_date: '2023-01-01',
                    language: 'English',
                    pages: 10,
                    document_type: 'Type 1',
                    document_description: 'Description 1',
                    area_id: 1,
                    long: 98.76,
                    lat: 54.32,
                    area_name: 'Area 1'
                },
                {
                    document_id: 2,
                    document_title: 'Document Title 2',
                    stakeholder: 'Stakeholder 2',
                    scale: 'Scale 2',
                    issuance_date: '2022-01-01',
                    language: 'Italian',
                    pages: 20,
                    document_type: 'Type 2',
                    document_description: 'Description 2',
                    area_id: 2,
                    long: 13.37,
                    lat: 57.89,
                    area_name: 'Area 2'
                }
            ];

            callback(null, mockData); 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should correctly group and format documents with geolocations', async () => {
        const result = await documentDAO.getDocumentsGeo();

        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                geolocations: [
                    {
                        area_name: 'Area 1',
                        coordinates: [
                            { long: 12.34, lat: 56.78 },
                            { long: 98.76, lat: 54.32 }
                        ]
                    }
                ]
            },
            {
                document_id: 2,
                document_title: 'Document Title 2',
                stakeholder: 'Stakeholder 2',
                scale: 'Scale 2',
                issuance_date: '2022-01-01',
                language: 'Italian',
                pages: 20,
                document_type: 'Type 2',
                document_description: 'Description 2',
                geolocations: [
                    {
                        area_name: 'Area 2',
                        coordinates: [
                            { long: 13.37, lat: 57.89 }
                        ]
                    }
                ]
            }
        ]);

        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should throw an error if there is an issue retrieving documents', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Errore durante il recupero dei documenti"), null);
        });

        await expect(documentDAO.getDocumentsGeo()).rejects.toThrow("Errore durante il recupero dei documenti");
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should handle multiple documents with the same area and different coordinates', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            const mockData = [
                {
                    document_id: 1,
                    document_title: 'Document Title 1',
                    stakeholder: 'Stakeholder 1',
                    scale: 'Scale 1',
                    issuance_date: '2023-01-01',
                    language: 'English',
                    pages: 10,
                    document_type: 'Type 1',
                    document_description: 'Description 1',
                    area_id: 1,
                    long: 12.34,
                    lat: 56.78,
                    area_name: 'Area 1'
                },
                {
                    document_id: 1,
                    document_title: 'Document Title 1',
                    stakeholder: 'Stakeholder 1',
                    scale: 'Scale 1',
                    issuance_date: '2023-01-01',
                    language: 'English',
                    pages: 10,
                    document_type: 'Type 1',
                    document_description: 'Description 1',
                    area_id: 1,
                    long: 98.76,
                    lat: 54.32,
                    area_name: 'Area 1'
                },
                {
                    document_id: 2,
                    document_title: 'Document Title 2',
                    stakeholder: 'Stakeholder 2',
                    scale: 'Scale 2',
                    issuance_date: '2022-01-01',
                    language: 'Italian',
                    pages: 20,
                    document_type: 'Type 2',
                    document_description: 'Description 2',
                    area_id: 1,
                    long: 13.37,
                    lat: 57.89,
                    area_name: 'Area 1'
                }
            ];
            callback(null, mockData);
        });

        const result = await documentDAO.getDocumentsGeo();

        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                geolocations: [
                    {
                        area_name: 'Area 1',
                        coordinates: [
                            { long: 12.34, lat: 56.78 },
                            { long: 98.76, lat: 54.32 }
                        ]
                    }
                ]
            },
            {
                document_id: 2,
                document_title: 'Document Title 2',
                stakeholder: 'Stakeholder 2',
                scale: 'Scale 2',
                issuance_date: '2022-01-01',
                language: 'Italian',
                pages: 20,
                document_type: 'Type 2',
                document_description: 'Description 2',
                geolocations: [
                    {
                        area_name: 'Area 1',
                        coordinates: [
                            { long: 13.37, lat: 57.89 }
                        ]
                    }
                ]
            }
        ]);
    });

    test('should return an empty array if no documents are found', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); 
        });

        const result = await documentDAO.getDocumentsGeo();

        expect(result).toEqual([]); 
        expect(db.all).toHaveBeenCalledTimes(1);
    });

    test('should correctly handle multiple documents each with a single area', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            const mockData = [
                {
                    document_id: 1,
                    document_title: 'Document Title 1',
                    stakeholder: 'Stakeholder 1',
                    scale: 'Scale 1',
                    issuance_date: '2023-01-01',
                    language: 'English',
                    pages: 10,
                    document_type: 'Type 1',
                    document_description: 'Description 1',
                    area_id: 1,
                    long: 12.34,
                    lat: 56.78,
                    area_name: 'Area 1'
                },
                {
                    document_id: 2,
                    document_title: 'Document Title 2',
                    stakeholder: 'Stakeholder 2',
                    scale: 'Scale 2',
                    issuance_date: '2022-01-01',
                    language: 'Italian',
                    pages: 20,
                    document_type: 'Type 2',
                    document_description: 'Description 2',
                    area_id: 2,
                    long: 98.76,
                    lat: 54.32,
                    area_name: 'Area 2'
                }
            ];
            callback(null, mockData);
        });

        const result = await documentDAO.getDocumentsGeo();

        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                geolocations: [
                    {
                        area_name: 'Area 1',
                        coordinates: [
                            { long: 12.34, lat: 56.78 }
                        ]
                    }
                ]
            },
            {
                document_id: 2,
                document_title: 'Document Title 2',
                stakeholder: 'Stakeholder 2',
                scale: 'Scale 2',
                issuance_date: '2022-01-01',
                language: 'Italian',
                pages: 20,
                document_type: 'Type 2',
                document_description: 'Description 2',
                geolocations: [
                    {
                        area_name: 'Area 2',
                        coordinates: [
                            { long: 98.76, lat: 54.32 }
                        ]
                    }
                ]
            }
        ]);
    });

    test('should correctly group documents with multiple geolocations for each document', async () => {
        const mockData = [
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                area_id: 1,
                long: 12.34,
                lat: 56.78,
                area_name: 'Area 1'
            },
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                area_id: 2,
                long: 23.45,
                lat: 67.89,
                area_name: 'Area 2'
            }
        ];
    
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockData); 
        });
    
        const result = await documentDAO.getDocumentsGeo();
    
        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                geolocations: [
                    { area_name: 'Area 1', coordinates: [{ long: 12.34, lat: 56.78 }] },
                    { area_name: 'Area 2', coordinates: [{ long: 23.45, lat: 67.89 }] }
                ]
            }
        ]);
    });

    test('should return multiple documents correctly', async () => {
        const mockData = [
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                area_id: 1,
                long: 12.34,
                lat: 56.78,
                area_name: 'Area 1'
            },
            {
                document_id: 2,
                document_title: 'Document Title 2',
                stakeholder: 'Stakeholder 2',
                scale: 'Scale 2',
                issuance_date: '2022-01-01',
                language: 'Italian',
                pages: 20,
                document_type: 'Type 2',
                document_description: 'Description 2',
                area_id: 2,
                long: 34.56,
                lat: 78.90,
                area_name: 'Area 2'
            }
        ];
    
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, mockData);
        });
    
        const result = await documentDAO.getDocumentsGeo();
    
        expect(result).toEqual([
            {
                document_id: 1,
                document_title: 'Document Title 1',
                stakeholder: 'Stakeholder 1',
                scale: 'Scale 1',
                issuance_date: '2023-01-01',
                language: 'English',
                pages: 10,
                document_type: 'Type 1',
                document_description: 'Description 1',
                geolocations: [
                    { area_name: 'Area 1', coordinates: [{ long: 12.34, lat: 56.78 }] }
                ]
            },
            {
                document_id: 2,
                document_title: 'Document Title 2',
                stakeholder: 'Stakeholder 2',
                scale: 'Scale 2',
                issuance_date: '2022-01-01',
                language: 'Italian',
                pages: 20,
                document_type: 'Type 2',
                document_description: 'Description 2',
                geolocations: [
                    { area_name: 'Area 2', coordinates: [{ long: 34.56, lat: 78.90 }] }
                ]
            }
        ]);
    });

    test('should return an empty array if no documents are found', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(null, []); 
        });
    
        const result = await documentDAO.getDocumentsGeo();
    
        expect(result).toEqual([]); 
    });
    test('should throw an error if the database query fails', async () => {
        db.all.mockImplementationOnce((query, params, callback) => {
            callback(new Error("Database query failed"), null);
        });
    
        await expect(documentDAO.getDocumentsGeo()).rejects.toThrow("Errore durante il recupero dei documenti");
    
        expect(db.all).toHaveBeenCalledTimes(1);
    });
    
});

describe('Suite test for insertDocument function', () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();

        jest.spyOn(db, 'serialize').mockImplementation((fn) => fn());
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null); 
        });
        jest.spyOn(db, 'get').mockImplementation((query, params, callback) => {
            if (callback) callback(null, null); 
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should correctly insert a new document', async () => {
        // Mock to start the transaction
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null);
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 0 });  // Document doesn't exist

        });
    
        // Mock to insert the document and return the ID
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) {
                callback.call({ lastID: 1 }, null); 
            }
        });
    
        // Mock to check if the area already exists
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // The area does not exist
        });
    
        // Mock to get the maximum area_id
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { maxId: 1 });
        });
    
        // Mock to insert into Geolocation
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(null);
        });
    
        // Mock to insert into Geolocation_Documents and commit the transaction
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(null);
        });
    
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null);
        });
    
        // Call the function with example data
        await expect(documentDAO.insertDocument(
            'Document Title',
            'Stakeholder',
            'Scale',
            '10/06/1998',
            3,
            'Italian',
            10,
            'Document Type',
            'Document Description',
            'Area Name',
            [{ long: 12.34, lat: 56.78 }]
        )).resolves.toBeUndefined();
    
        // Verify that the database functions have been called correctly
        expect(db.serialize).toHaveBeenCalled();
        expect(db.run).toHaveBeenCalledWith('BEGIN TRANSACTION', expect.any(Function));
        expect(db.get).toHaveBeenCalledTimes(3);
        expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function)); // Insert Document
    });

    jest.clearAllMocks();
    jest.resetAllMocks();
    
    test('should fail if inserting the document fails', async () => {
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null); // Start transaction
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 0 }); // Document does not exist
        });
    
        // Mock to simulate an error during insertion
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(new Error('Error during document insertion'));
        });
    
        await expect(documentDAO.insertDocument(
            'Document Title',
            'Stakeholder',
            'Scale',
            '10/06/1998',
            3,
            'Italian',
            10,
            'Document Type',
            'Document Description',
            'Area Name',
            [{ long: 12.34, lat: 56.78 }]
        )).rejects.toThrow('Error during document insertion');
    
        // Verify that the run function for rollback has been called
        expect(db.run).toHaveBeenCalledWith('ROLLBACK');
    });
    
    jest.resetAllMocks();
    test('should fail if the document insertion fails', async () => {
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null); // Start transaction
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 0 }); // Document does not exist
        });
    
        // Mock to simulate an error during insertion
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(new Error('Error during document insertion'));
        });
    
        await expect(documentDAO.insertDocument(
            'Document Title',
            'Stakeholder',
            'Scale',
            '10/06/1998',
            3,
            'Italian',
            10,
            'Document Type',
            'Document Description',
            'Area Name',
            [{ long: 12.34, lat: 56.78 }]
        )).rejects.toThrow('Error during document insertion');
    
        // Verify that the run function for rollback has been called
        expect(db.run).toHaveBeenCalledWith('ROLLBACK');
    });
    test('should rollback if an error occurs during insertion in Geolocation', async () => {
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null); // Start transaction
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 0 }); // Document does not exist
        });
    
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) {
                callback.call({ lastID: 1 }, null); // Return ID
            }
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // The area does not exist
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { maxId: 1 });
        });
    
        // Mock to simulate an error during insertion in Geolocation
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(new Error('Error during insertion in Geolocation'));
        });
    
        await expect(documentDAO.insertDocument(
            'Document Title',
            'Stakeholder',
            'Scale',
            '10/06/1998',
            3,
            'Italian',
            10,
            'Document Type',
            'Document Description',
            'Area Name',
            [{ long: 12.34, lat: 56.78 }]
        )).rejects.toThrow('Error during insertion in Geolocation');
    
        // Verify that the run function for rollback has been called
        expect(db.run).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should rollback if an error occurs during insertion in Geolocation', async () => {
        db.run.mockImplementationOnce((query, callback) => {
            if (callback) callback(null); // Start transaction
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 0 }); // Document does not exist
        });
    
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) {
                callback.call({ lastID: 1 }, null); // Return ID
            }
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, null); // The area does not exist
        });
    
        db.get.mockImplementationOnce((query, params, callback) => {
            callback(null, { maxId: 1 });
        });
    
        // Mock to simulate an error during insertion in Geolocation
        db.run.mockImplementationOnce((query, params, callback) => {
            if (callback) callback(new Error('Error during insertion in Geolocation'));
        });
    
        await expect(documentDAO.insertDocument(
            'Document Title',
            'Stakeholder',
            'Scale',
            '10/06/1998',
            3,
            'Italian',
            10,
            'Document Type',
            'Document Description',
            'Area Name',
            [{ long: 12.34, lat: 56.78 }]
        )).rejects.toThrow('Error during insertion in Geolocation');
    
        // Verify that the run function for rollback has been called
        expect(db.run).toHaveBeenCalledWith('ROLLBACK');
    });
});    

describe("Suite test for linkDocuments function", () => {
    let documentDAO;

    beforeAll(() => {
        documentDAO = new DocumentDAO();
    });

        test("Successful creation of a link between documents", async () => {
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

            const result = await documentDAO.linkDocuments(1, 2, "related");
            expect(result).toEqual({
                parent_id: 1,
                children_id: 2,
                connection_type: "related",
            });

            db.get.mockRestore();
            db.run.mockRestore();
        });

        test("Error parent node not found", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null); // Parent node not found
            });

            await expect(documentDAO.linkDocuments(1, 2, "related"))
                .rejects.toThrow("Parent Node not found! Please verify the ID.");

            db.get.mockRestore();
        });

        test("Error link already exists", async () => {
            jest.spyOn(db, "get")
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { document_id: 1 }); // Parent node exists
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { document_id: 2 }); // Child node exists
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, { connection_id: 1 }); // Connection already exists
                });

            await expect(documentDAO.linkDocuments(1, 2, "related"))
                .rejects.toThrow("A connection already exists between these nodes. Duplicate entries are not allowed!");

            db.get.mockRestore();
        });

        test("Generic error during link insertion", async () => {
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
                callback(new Error("Generic error during insertion")); // Simulates error
            });

            await expect(documentDAO.linkDocuments(1, 2, "related"))
                .rejects.toThrow("Failed to insert connection: Generic error during insertion");

            db.get.mockRestore();
            db.run.mockRestore();
        });
    

    test("Error retrieving child node", async () => {
        jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { document_id: 1 }); // Parent node exists
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Error retrieving child node")); // Simulates error
            });
    
        await expect(documentDAO.linkDocuments(1, 2, "related"))
            .rejects.toThrow("Child Node not found! Please double-check the ID.");
    
        db.get.mockRestore();
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

    describe("deleteArea", () => {

        let documentDAO;
    
        beforeAll(() => {
            documentDAO = new DocumentDAO();
        });
    
      afterEach(() => {
        jest.clearAllMocks(); // Resetta i mock dopo ogni test
      });
    
      test("should reject if attempting to delete 'Kiruna Map'", async () => {
        await expect(documentDAO.deleteArea("Kiruna Map")).rejects.toThrow("Cannot delete Kiruna Map");
      });
    
      test("should successfully delete an area", async () => {
        const mockAreaName = "Test Area";
    
        // Mock del metodo db.get per restituire un'area trovata
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, { area_id: 1 });
        });
    
        // Mock del metodo db.run per simulare aggiornamenti e cancellazioni riusciti
        db.run.mockImplementation((query, params, callback) => {
          callback(null);
        });
    
        const result = await documentDAO.deleteArea(mockAreaName);
        expect(result).toBe("Area eliminata con successo.");
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockAreaName], expect.any(Function));
        expect(db.run).toHaveBeenCalledTimes(2); // Un'operazione per update e una per delete
      });
    
      test("should reject if area search fails", async () => {
        const mockAreaName = "Test Area";
    
        // Mock del metodo db.get per simulare un errore
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Database error"), null);
        });
    
        await expect(documentDAO.deleteArea(mockAreaName)).rejects.toThrow("Errore durante la ricerca dell'area");
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockAreaName], expect.any(Function));
      });
    
      test("should reject if document update fails", async () => {
        const mockAreaName = "Test Area";
    
        // Mock del metodo db.get per restituire un'area trovata
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, { area_id: 1 });
        });
    
        // Mock del metodo db.run per simulare un errore durante l'aggiornamento dei documenti
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Update error"));
        });
    
        await expect(documentDAO.deleteArea(mockAreaName)).rejects.toThrow("Errore durante l'aggiornamento dei documenti");
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockAreaName], expect.any(Function));
        expect(db.run).toHaveBeenCalledTimes(1); // Solo l'operazione di update viene eseguita
      });
    
      test("should reject if area deletion fails", async () => {
        const mockAreaName = "Test Area";
    
        // Mock del metodo db.get per restituire un'area trovata
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, { area_id: 1 });
        });
    
        // Mock del metodo db.run per simulare un aggiornamento riuscito
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(null);
        });
    
        // Mock del metodo db.run per simulare un errore durante la cancellazione dell'area
        db.run.mockImplementationOnce((query, params, callback) => {
          callback(new Error("Delete error"));
        });
    
        await expect(documentDAO.deleteArea(mockAreaName)).rejects.toThrow("Errore durante la cancellazione dell'area");
        expect(db.get).toHaveBeenCalledWith(expect.any(String), [mockAreaName], expect.any(Function));
        expect(db.run).toHaveBeenCalledTimes(2); // Entrambe le operazioni vengono eseguite
      });
    
    });
    

    describe('Suite test for addArea function', () => {
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
    
    
        test('should fail when coordinates are missing or invalid', async () => {
            const invalidArea = [
                { long: null, lat: 56.78, area_name: "Invalid Area", n_order: 1, sub_area_id: null },
            ];
    
            await expect(documentDAO.addArea(invalidArea)).rejects.toEqual({
                code: 422,
                message: "Missing or invalid latitude/longitude.",
            });
    
            expect(db.get).not.toHaveBeenCalled(); // Nessun accesso al database
            expect(db.run).not.toHaveBeenCalled();
        });
    
        test('should fail when area name is missing', async () => {
            const invalidArea = [
                { long: 12.34, lat: 56.78, area_name: null, n_order: 1, sub_area_id: null },
            ];
    
            await expect(documentDAO.addArea(invalidArea)).rejects.toEqual({
                code: 422,
                message: "Missing area name.",
            });
    
            expect(db.get).not.toHaveBeenCalled();
            expect(db.run).not.toHaveBeenCalled();
        });
    
        test('should fail if area name already exists', async () => {
            const mockArea = [
                { long: 12.34, lat: 56.78, area_name: "Existing Area", n_order: 1, sub_area_id: null },
            ];
    
            db.get.mockImplementationOnce((query, params, callback) => {
                callback(null, { exists: 1 }); // L'area esiste già
            });
    
            await expect(documentDAO.addArea(mockArea)).rejects.toEqual({
                code: 403,
                message: "Area name already exists.",
            });
    
            expect(db.get).toHaveBeenCalledTimes(1); // Controllo esistenza
            expect(db.run).not.toHaveBeenCalled();
        });
    
        test('should fail if a coordinate is missing long or lat', async () => {
            const mockArea = [
                { lat: 56.78, area_name: "Test Area", n_order: 1, sub_area_id: null } // Mancanza di `long`
            ];
        
            await expect(documentDAO.addArea(mockArea)).rejects.toEqual({
                code: 422,
                message: "Missing or invalid latitude/longitude."
            });
        });
        test('should fail if a database error occurs when checking if area exists', async () => {
            const mockArea = [
                { long: 12.34, lat: 56.78, area_name: "Test Area", n_order: 1, sub_area_id: null }
            ];
        
            db.get.mockImplementationOnce((query, params, callback) => callback(new Error("Errore durante la verifica dell'area")));
        
            await expect(documentDAO.addArea(mockArea)).rejects.toEqual({
                code: 500,
                message: "Database error: Errore durante la verifica dell'area"
            });
        });
    
        test('should fail if the area list is empty', async () => {
            const mockArea = [];
        
            await expect(documentDAO.addArea(mockArea)).rejects.toEqual({
                code: 422,
                message: "Missing or invalid latitude/longitude."
            });
        });
        
        
    });
    
    describe('Suite test for getArea function', () => {
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
    
    
        test('should retrieve areas successfully', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: null },
                { id: 1, name: "Area 1", latitude: 10.1, longitude: 20.1, n_order: 2, sub_area_id: null },
                { id: 2, name: "Area 2", latitude: 15.0, longitude: 25.0, n_order: 1, sub_area_id: 1 },
                { id: 2, name: "Area 2", latitude: 15.1, longitude: 25.1, n_order: 2, sub_area_id: 1 },
                { id: 2, name: "Area 2", latitude: 15.2, longitude: 25.2, n_order: 1, sub_area_id: 2 },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [
                        { lat: 10.0, lng: 20.0 },
                        { lat: 10.1, lng: 20.1 },
                    ],
                },
                {
                    id: 2,
                    name: "Area 2",
                    latlngs: [
                        [
                            { lat: 15.0, lng: 25.0 },
                            { lat: 15.1, lng: 25.1 },
                        ],
                        [
                            { lat: 15.2, lng: 25.2 },
                        ],
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
        test('should return only Point-Based Documents if no areas are found', async () => {
            db.all.mockImplementationOnce((query, callback) => callback(null, []));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
    
        test('should reject with an error if the database query fails', async () => {
            db.all.mockImplementationOnce((query, callback) => callback(new Error("Database error")));
        
            await expect(documentDAO.getAreas()).rejects.toThrow("Errore durante il recupero delle aree.");
        });
        
        test('should remove duplicate areas based on name', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: null },
                { id: 1, name: "Area 1", latitude: 10.1, longitude: 20.1, n_order: 2, sub_area_id: null },
                { id: 2, name: "Area 1", latitude: 15.0, longitude: 25.0, n_order: 1, sub_area_id: 1 },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [
                        { lat: 10.0, lng: 20.0 },
                        { lat: 10.1, lng: 20.1 },
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
        test('should handle rows with null sub_area_id correctly', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: null },
                { id: 1, name: "Area 1", latitude: 10.1, longitude: 20.1, n_order: 2, sub_area_id: null },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [
                        { lat: 10.0, lng: 20.0 },
                        { lat: 10.1, lng: 20.1 },
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
        test('should handle areas without coordinates (latitude and longitude null)', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: null, longitude: null, n_order: 1, sub_area_id: null },
                { id: 2, name: "Area 2", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: null },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [],
                },
                {
                    id: 2,
                    name: "Area 2",
                    latlngs: [
                        { lat: 10.0, lng: 20.0 },
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        
        });
    
        test('should correctly separate areas with mixed sub_area_id (null and defined)', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: null },
                { id: 1, name: "Area 1", latitude: 10.1, longitude: 20.1, n_order: 1, sub_area_id: 1 },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [
                        { lat: 10.0, lng: 20.0 },
                        [
                            { lat: 10.1, lng: 20.1 },
                        ],
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
        test('should handle sub_area_id with missing or sparse data correctly', async () => {
            const mockRows = [
                { id: 1, name: "Area 1", latitude: 10.0, longitude: 20.0, n_order: 1, sub_area_id: 1 },
                { id: 1, name: "Area 1", latitude: null, longitude: null, n_order: 1, sub_area_id: 2 },
                { id: 1, name: "Area 1", latitude: 10.1, longitude: 20.1, n_order: 2, sub_area_id: 1 },
            ];
        
            db.all.mockImplementationOnce((query, callback) => callback(null, mockRows));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 1,
                    name: "Area 1",
                    latlngs: [
                        [
                            { lat: 10.0, lng: 20.0 },
                            { lat: 10.1, lng: 20.1 },
                        ],
                    ],
                },
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
        test('should always include "Point-Based Documents" in the result', async () => {
            db.all.mockImplementationOnce((query, callback) => callback(null, []));
        
            const result = await documentDAO.getAreas();
        
            expect(result).toEqual([
                {
                    id: 0,
                    name: "Point-Based Documents",
                    latlngs: [],
                },
            ]);
        });
        
    
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