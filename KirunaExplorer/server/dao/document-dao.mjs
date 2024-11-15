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

async getDocumentsGeo() {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT D.document_id, D.document_title, D.stakeholder, D.scale, D.issuance_date,
                 D.language, D.pages, D.document_type, D.document_description,
                 G.area_id, G.long, G.lat, G.area_name
          FROM Documents D
          JOIN Geolocation_Documents GD ON D.document_id = GD.document_id
          JOIN Geolocation G ON G.area_id = GD.area_id
      `;

      db.all(query, [], (err, rows) => {
          if (err) {
              console.error("Errore durante il recupero dei documenti:", err);
              return reject(new Error("Errore durante il recupero dei documenti."));
          }

          // Raggruppa i risultati per documento e area_id
          const documentsMap = {};

          rows.forEach(row => {
              const docId = row.document_id;
              
              // Se il documento non esiste ancora nella mappa, inizializzalo
              if (!documentsMap[docId]) {
                  documentsMap[docId] = {
                      document_id: row.document_id,
                      document_title: row.document_title,
                      stakeholder: row.stakeholder,
                      scale: row.scale,
                      issuance_date: row.issuance_date,
                      language: row.language,
                      pages: row.pages,
                      document_type: row.document_type,
                      document_description: row.document_description,
                      geolocations: {}
                  };
              }

              // Aggiungi le coordinate per l'area_id corrente
              const areaId = row.area_id;
              if (!documentsMap[docId].geolocations[areaId]) {
                  documentsMap[docId].geolocations[areaId] = {
                      area_name: row.area_name,
                      coordinates: []
                  };
              }

              // Aggiungi la coordinata corrente
              documentsMap[docId].geolocations[areaId].coordinates.push({
                  long: row.long,
                  lat: row.lat
              });
          });

          // Trasforma la mappa in un array di documenti con geolocalizzazioni
          const documentsArray = Object.values(documentsMap).map(document => {
              document.geolocations = Object.values(document.geolocations);
              return document;
          });

          // Restituisce l'elenco dei documenti strutturato come richiesto
          resolve(documentsArray);
      });
  });
}


  async insertDocument(document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description, area_name, coords) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            let coordinates = [];
            coordinates.push(coords);   //devo mettere le coordinate nell'array perchè sennò da errore la map
           
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) return reject(err);

                
                const checkDocumentQuery = 'SELECT COUNT(*) AS count FROM Documents WHERE document_title = ?';
                db.get(checkDocumentQuery, [document_title], (err, row) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    if (row.count > 0) {
                        db.run('ROLLBACK');
                        return reject(403);
                    }


                    const insertDocumentQuery = `
                        INSERT INTO Documents(document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.run(insertDocumentQuery, [document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description], function (err) {                     
                        if (err) {
                          console.log(err);

                            db.run('ROLLBACK');
                            return reject(err);
                        }
                        
                        const document_id = this.lastID;

                       
                        const checkAreaQuery = `SELECT area_id FROM Geolocation WHERE area_name = ?`;
                        db.get(checkAreaQuery, [area_name], (err, areaRow) => {
                            if (err) {
                                db.run('ROLLBACK');
                                return reject(err);
                            }

                            if (areaRow && area_name=='Whole Area') {
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
                                const maxIdQuery = `SELECT MAX(area_id) as maxId FROM Geolocation`;

                                db.get(maxIdQuery, [], (err, row) => {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return reject(err);
                                    }

                                    const newAreaId = (row.maxId || 0) + 1;
                                    const insertGeolocationQuery = `
                                        INSERT INTO Geolocation (area_id, long, lat, area_name) 
                                        VALUES (?, ?, ?, ?)
                                    `;

                                    if(coordinates.length !== 1) {
                                        db.run('ROLLBACK');
                                        return reject(422);
                                    }

                                    
                                    const insertCoordinates = coordinates.map(coord => {
                                        return new Promise((resolveCoord, rejectCoord) => {
                                            db.run(insertGeolocationQuery, [newAreaId, coord.long, coord.lat, "Point"], function(err) {
                                                if (err) return rejectCoord(err);
                                                resolveCoord();
                                            });
                                        });
                                    });

                                    Promise.all(insertCoordinates).then(() => {
                                        const geolocationDocQuery = `
                                            INSERT INTO Geolocation_Documents (area_id, document_id) 
                                            VALUES (?, ?)
                                        `;

                                        db.run(geolocationDocQuery, [newAreaId, document_id], (err) => {
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
    });
}

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

    //GeoUpdate part

    async updatePointCoords(document_id,long,lat) {

      // SQL queries to retrieve and insert data
      const sqlQueryNodeExistence = `
            SELECT * FROM Documents
            WHERE document_id = ?
          `;
      const maxIdQuery = `SELECT MAX(area_id) as maxId FROM Geolocation`;    
      const sqlQueryGeolocationInsert = `
           INSERT INTO Geolocation(area_id,long,lat,area_name) 
                        VALUES (?,?, ?, ?)
                    `;
      const sqlQueryUpdateGeolocationDocument = `
           UPDATE Geolocation_Documents
           SET area_id = ?
           WHERE document_id = ?;
                    `;     
      let area_id = -1;                                     

      //Check if node exists
      
      const node = await new Promise((resolve, reject) => {
        db.get(sqlQueryNodeExistence, [document_id], (err, node) => {
          if (!node) {
            reject(new Error("Node not found!"));
          } else if (err) {
            reject(new Error(`Error while retrieving node: ${err.message}`));
          } else {
            resolve(node);
          }
        });
      });

      const area_id_max = await new Promise((resolve, reject) => {
            const maxIdQuery = `SELECT MAX(area_id) as maxId FROM Geolocation`;
    
            db.get(maxIdQuery, [], (err, row) => {
                if (err) {
                    return reject(new Error(`Errore durante il recupero del maxId: ${err.message}`));
                }
    
                // Calcolo del nuovo `area_id`
                const newAreaId = (row.maxId || 0) + 1;
                area_id=newAreaId;
                console.log(`Nuovo area_id generato: ${newAreaId}`);
                resolve(newAreaId);
            });
        });                                   
  
      // Insert on Geolocation
      const insertOnGeolocation = await new Promise((resolve, reject) => {
        db.run(sqlQueryGeolocationInsert, [area_id,long,lat,"Point"], function (err) {
          if (err) {
            reject(new Error(`Failed to insert Geolocation: ${err.message}`));
          } else {
            resolve(this.lastID);  //da testare se funziona
          }
        });
      });

      //Update on Geolocation_Documents
      const updateOnGeolocationDocuments = await new Promise((resolve, reject) => {
        db.run(sqlQueryUpdateGeolocationDocument, [area_id,document_id], function (err) {
          if (err) {
            reject(new Error(`Failed to update on Geolocation Documents: ${err.message}`));
          } else {           
            resolve(this.changes);  //da testare se funziona
          }
        });
      });


      return insertOnGeolocation;
  };

}


async function testUpdatePointCoords() {
  const dao = new DocumentDAO();

  try {
    const document_id = 1; // Cambia con un document_id valido
    const longitude = 12.4924;
    const latitude = 41.8902;

    console.log("Inizio test per updatePointCoords...");
    const result = await dao.updatePointCoords(document_id, longitude, latitude);
    console.log("Test completato, area_id inserito:", result);
  } catch (error) {
    console.error("Errore durante il test:", error.message);
  } finally {
    db.close(() => {
      console.log("Connessione al database chiusa.");
    });
  }
}

// Esegui il test
testUpdatePointCoords();




export default DocumentDAO;

