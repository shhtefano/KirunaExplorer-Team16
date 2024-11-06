import { db } from '../db/db.mjs';

class DocumentDAO {

  async getDocuments() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM Documents
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("Errore durante il recupero dei documenti:", err);
                return reject(new Error("Errore durante il recupero dei documenti."));
            }
            
            // Restituisce l'elenco dei documenti recuperati
            resolve(rows);
        });
    });
}

    async insertDocument(document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description, area_name, coordinates) {
        return new Promise(async (resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
    
                // Verifica se il documento esiste già
                const checkDocumentQuery = 'SELECT COUNT(*) AS count FROM Documents WHERE document_title = ?';
                db.get(checkDocumentQuery, [document_title], (err, row) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }
    
                    if (row.count > 0) {
                        db.run('ROLLBACK');
                        return reject(new Error('Document already exists.'));
                    }

                    // Inserisce il nuovo documento
                    const insertDocumentQuery = `
                        INSERT INTO Documents(document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.run(insertDocumentQuery, [document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description], function (err) {                     
                      if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }
    
                        const document_id = this.lastID;  // Ottiene l'ID del documento appena inserito
    
                        // Verifica se l'area con lo stesso nome esiste già
                        const checkAreaQuery = `SELECT area_id FROM Geolocation WHERE area_name = ?`;

                        db.get(checkAreaQuery, [area_name], (err, areaRow) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }
    
                            if (areaRow) {
                                const areaId = areaRow.area_id;
    
                                const geolocationDocQuery = `
                                    INSERT INTO Geolocation_Documents (area_id, document_id) 
                                    VALUES (?, ?)
                                `;
                                db.run(geolocationDocQuery, [areaId, document_id], (err) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
                                    db.run('COMMIT', (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return reject(err);
                                        }
                                        resolve();
                                    });
                                });
    
                            } else {

                                // L'area non esiste, inserisci una nuova riga in Geolocation e ottieni un nuovo area_id
                                const maxIdQuery = `SELECT MAX(area_id) as maxId FROM Geolocation`;
    
                                db.get(maxIdQuery, [], (err, row) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }
    
                                    // Calcola il nuovo area_id
                                    const newAreaId = (row.maxId || 0) + 1;
    
                                    
                                    const insertGeolocationQuery = `
                                        INSERT INTO Geolocation (area_id, long, lat, area_name) 
                                        VALUES (?, ?, ?, ?)
                                    `;
                                    
                                    // Inserisce tutte le coordinate nella tabella Geolocation
                                    if(coordinates.length !== 1){
                                        return reject(err);
                                    }
                                    const insertCoordinates = coordinates.map(coord => {
                                        return new Promise((resolveCoord, rejectCoord) => {
                                            db.run(insertGeolocationQuery, [newAreaId, coord.long, coord.lat, "Point"], function(err) {
                                                if (err) {
                                                    return rejectCoord(err);
                                                }
                                                resolveCoord();
                                            });
                                        });
                                    });
    
                                    // Usa Promise.all per aspettare il completamento di tutti gli inserimenti delle coordinate
                                    Promise.all(insertCoordinates).then(() => {
                                        // Aggiunge la relazione tra l'area e il documento nella tabella Geolocation_Documents
                                        const geolocationDocQuery = `
                                            INSERT INTO Geolocation_Documents (area_id, document_id) 
                                            VALUES (?, ?)
                                        `;
    
                                        db.run(geolocationDocQuery, [newAreaId, document_id], (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                return reject(err);
                                            }
    
                                            // Committa la transazione
                                            db.run('COMMIT', (err) => {
                                                if (err) {
                                                    db.run('ROLLBACK');
                                                    return reject(err);
                                                }
                                                resolve();
                                            });
                                        });
                                    }).catch(err => {
                                        db.run('ROLLBACK');
                                        reject(err);
                                    });
                                });
                            }
                        });
                    });
                });
                
              });
        });
    };

    async linkDocuments(parent_id, children_id, connection_type) {

        // SQL queries to retrieve and insert data
        const sqlQueryNodeExistence = `
              SELECT * FROM Documents
              WHERE document_title = ?
            `;
        const sqlQueryConnectionExistence = `
              SELECT * FROM Connections
              WHERE parent_id = ? AND children_id = ?
            `;
        const sqlQueryInverseConnectionExistence = `
              SELECT * FROM Connections
              WHERE parent_id = ? AND children_id = ?
            `;
        const sqlInsertConnection = `
              INSERT INTO Connections (parent_id, children_id, connection_type)
              VALUES (?, ?, ?)
            `;
    
    
        // Verify the presence of the parent node with extensive detail
        const parentNode = await new Promise((resolve, reject) => {
          db.get(sqlQueryNodeExistence, [parent_id], (err, node) => {
            if (!node) {
              reject(new Error("Parent Node not found! Please verify the ID."));
            } else if (err) {
              reject(new Error(`Error while retrieving parent node: ${err.message}`));
            } else {
              resolve(node);
            }
          });
        });
    
        // Verify the presence of the child node with extensive error-handling
        const childNode = await new Promise((resolve, reject) => {
          db.get(sqlQueryNodeExistence, [children_id], (err, node) => {
            if (!node) {
              reject(new Error("Child Node not found! Please double-check the ID."));
            } else if (err) {
              reject(new Error(`Error retrieving child node: ${err.message}`));
            } else {
              resolve(node);
            }
          });
        });
    
        // Confirm that the connection does not already exist between these specific nodes
        await new Promise((resolve, reject) => {
          db.get(sqlQueryConnectionExistence, [parent_id, children_id], (err, row) => {
            if (row) {
              reject(new Error("A connection already exists between these nodes. Duplicate entries are not allowed!"));
            } else if (err) {
              reject(new Error(`Error while checking connection existence: ${err.message}`));
            } else {
              resolve();
            }
          });
        });
    
        // Confirm that the inverse connection does not already exist (to prevent duplicate connections in reverse order)
        await new Promise((resolve, reject) => {
          db.get(sqlQueryInverseConnectionExistence, [children_id, parent_id], (err, row) => {
            if (row) {
              reject(new Error("An inverse connection already exists between these nodes. Duplicate entries in reverse order are not allowed!"));
            } else if (err) {
              reject(new Error(`Error while checking inverse connection existence: ${err.message}`));
            } else {
              resolve();
            }
          });
        });
    
        // Insert the connection if all checks pass, creating a brand-new, unique linkage
        const connection = await new Promise((resolve, reject) => {
          db.run(sqlInsertConnection, [parent_id, children_id, connection_type], function (err) {
            if (err) {
              reject(new Error(`Failed to insert connection: ${err.message}`));
            } else {
              resolve({
                parent_id: parent_id,
                children_id: children_id,
                connection_type: connection_type,
              });
            }
          });
        });

        return connection;
    };

}

export default DocumentDAO;

