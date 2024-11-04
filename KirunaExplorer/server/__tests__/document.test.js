import { describe, test, expect, jest, beforeAll } from "@jest/globals";
import { db } from "../db/db.mjs";
import DocumentDAO from "../dao/document-dao.mjs";

jest.mock('../db/db.mjs'); // Mocka il modulo del database

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
        expect(db.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
        expect(db.get).toHaveBeenCalledTimes(3);
        expect(db.run).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function)); // Insert Document
    });
    
    test('should fail if the document already exists', async () => {
        // Spy on the get function
        jest.spyOn(db, 'get').mockImplementationOnce((query, params, callback) => {
            callback(null, { count: 1 }); // Simulate the case where the document already exists
        });
    
        // Spy on the run function
        jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
            if (callback) callback(null);
        });
    
        // Verify that the function generates an "Document already exists" error
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
        )).rejects.toThrow('Document already exists.');
    
        // Verify that the run function for rollback has been called
        expect(db.run).toHaveBeenCalledWith('ROLLBACK');
    });
    
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

    describe("Test for linkDocuments", () => {
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
    
});
