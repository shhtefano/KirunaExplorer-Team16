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
    
});
