import { db } from '../db/db.mjs';

class DocumentDAO {

  async getDocuments() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          D.document_id,
          D.document_title,
          D.scale,
          D.issuance_date,
          D.language,
          D.pages,
          D.document_type,
          D.document_description,
          S.stakeholder_name
        FROM Documents D
        JOIN Document_Stakeholder DS ON D.document_id = DS.document_id
        JOIN Stakeholders S ON DS.stakeholder_id = S.stakeholder_id;
      `;
  
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Errore durante il recupero dei documenti:", err);
          return reject(new Error("Errore durante il recupero dei documenti."));
        }
  
        // Raggruppa i dati
        const documentsMap = {};
  
        rows.forEach(row => {
          const docId = row.document_id;
  
          if (!documentsMap[docId]) {
            // Crea un nuovo oggetto per il documento
            documentsMap[docId] = {
              document_id: row.document_id,
              document_title: row.document_title,
              scale: row.scale,
              issuance_date: row.issuance_date,
              language: row.language,
              pages: row.pages,
              document_type: row.document_type,
              document_description: row.document_description,
              stakeholders: [], // Inizializza un array per gli stakeholder
            };
          }
  
          // Aggiungi il nome dello stakeholder all'array del documento
          documentsMap[docId].stakeholders.push(row.stakeholder_name);
        });
  
        // Converti la mappa in un array
        const documents = Object.values(documentsMap);
        console.log(documents);
        
        resolve(documents);
      });
    });
  }

  
  
  async getDocumentsGeo() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          D.document_id, D.document_title, D.scale, D.issuance_date,
          D.language, D.pages, D.document_type, D.document_description,
          G.area_id, G.long, G.lat, G.area_name,
          S.stakeholder_name
        FROM Documents D
        JOIN Geolocation_Documents GD ON D.document_id = GD.document_id
        JOIN Geolocation G ON G.area_id = GD.area_id
        JOIN Document_Stakeholder DS ON D.document_id = DS.document_id
        JOIN Stakeholders S ON DS.stakeholder_id = S.stakeholder_id
      `;
  
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Errore durante il recupero dei documenti:", err);
          return reject(new Error("Errore durante il recupero dei documenti."));
        }
  
        // Raggruppa i risultati per documento
        const documentsMap = {};
  
        rows.forEach(row => {
          const docId = row.document_id;
  
          // Se il documento non esiste ancora nella mappa, inizializzalo
          if (!documentsMap[docId]) {
            documentsMap[docId] = {
              document_id: row.document_id,
              document_title: row.document_title,
              scale: row.scale,
              issuance_date: row.issuance_date,
              language: row.language,
              pages: row.pages,
              document_type: row.document_type,
              document_description: row.document_description,
              stakeholders: [], // Array per gli stakeholder
              geolocations: {} // Oggetto per le geolocalizzazioni
            };
          }
  
          // Aggiungi lo stakeholder se non è già presente
          const stakeholderName = row.stakeholder_name;
          if (!documentsMap[docId].stakeholders.includes(stakeholderName)) {
            documentsMap[docId].stakeholders.push(stakeholderName);
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

        console.log(documentsArray);
        
  
        // Restituisce l'elenco dei documenti strutturato come richiesto
        resolve(documentsArray);
      });
    });
  }
  
  async getDocumentPosition(document_id) {
    return new Promise((resolve, reject) => {
      // Query SQL per ottenere i dettagli del documento e le coordinate
      const query = `
        SELECT 
          d.document_id,
          d.document_title,
          d.scale,
          d.issuance_date,
          d.language,
          d.pages,
          d.document_type,
          d.document_description,
          g.lat,
          g.long,
          g.area_name
        FROM 
          Documents d
        LEFT JOIN 
          Geolocation_Documents gd 
          ON d.document_id = gd.document_id
        LEFT JOIN 
          Geolocation g 
          ON gd.area_id = g.area_id
        WHERE 
          d.document_id = ?
      `;

      db.all(query, [document_id], (err, rows) => {
        if (err) {
          return reject(err); // Gestione errori
        }

        if (rows.length === 0) {
          return resolve(null); // Documento non trovato
        }

        // Estrai informazioni comuni del documento (valori identici in tutte le righe)
        const documentInfo = {
          document_id: rows[0].document_id,
          document_title: rows[0].document_title,
          scale: rows[0].scale,
          issuance_date: rows[0].issuance_date,
          language: rows[0].language,
          pages: rows[0].pages,
          document_type: rows[0].document_type,
          document_description: rows[0].document_description,
          area_name: rows[0].area_name, // Area associata
        };

        // Mappa le coordinate in un array
        const coordinates = rows.map(row => ({
          lat: row.lat,
          lng: row.long,
        }));
console.log(documentInfo, coordinates);

        // Restituisci il risultato
        resolve({
          ...documentInfo,
          coordinates,
        });
      });
    });
  }


  async insertDocument(document_title, stakeholders, scale, issuance_date, language, pages, document_type, document_description, area_name, coords) {
    //Converting stakeholder names to stakeholderIds
    let stakeholderIds = [];
    stakeholderIds= await this.util_getStakeholdersIDs(stakeholders);  
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        let coordinates = [];
        coordinates.push(coords);   //devo mettere le coordinate nell'array perchè sennò da errore la map
        console.log(stakeholderIds);
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
                        INSERT INTO Documents(document_title, scale, issuance_date, language, pages, document_type, document_description) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `;
            db.run(insertDocumentQuery, [document_title, scale, issuance_date, language, pages, document_type, document_description], function (err) {
              if (err) {
                console.log(err);

                db.run('ROLLBACK');
                return reject(err);
              }

              const document_id = this.lastID;

              const insertDocumentStakeholderQuery = `
              INSERT INTO Document_Stakeholder (stakeholder_id,document_id) 
              VALUES (?, ?)
            `; 
            stakeholderIds.forEach(stakeholder => {
              db.run(insertDocumentStakeholderQuery, [stakeholder,document_id], function (err) {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }
              });
            });


              const checkAreaQuery = `SELECT area_id FROM Geolocation WHERE area_name = ?`;
              db.get(checkAreaQuery, [area_name], (err, areaRow) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                if (areaRow && area_name == 'Whole Area') {
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

                    if (coordinates.length !== 1) {
                      db.run('ROLLBACK');
                      return reject(422);
                    }


                    const insertCoordinates = coordinates.map(coord => {
                      return new Promise((resolveCoord, rejectCoord) => {
                        db.run(insertGeolocationQuery, [newAreaId, coord.long, coord.lat, "Point-Based Documents"], function (err) {
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
          reject("Duplicated link");
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
          reject("Duplicated link");
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

  async updatePointCoordinates(document_id, long, lat) {
    return new Promise((resolve, reject) => {
      // 1. Trova l'area_id associato al document_id
      const findAreaIdQuery = `
        SELECT GD.area_id 
        FROM Geolocation_Documents GD
        WHERE GD.document_id = ?
      `;

      db.get(findAreaIdQuery, [document_id], (err, row) => {
        if (err) {
          console.error("Errore durante il recupero dell'area_id:", err);
          return reject(new Error("Errore durante il recupero dell'area_id."));
        }

        if (!row) {
          // Se non troviamo un'area_id associata al document_id
          return reject(new Error("Nessun area_id trovato per il document_id fornito."));
        }

        const areaId = row.area_id;
        if (areaId == 0) {
          // 1. Il punto era associato ad un'area
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



            db.run(insertGeolocationQuery, [newAreaId, long, lat, "Point-Based Documents"], function (err) {
              if(err){
                console.error("Errore durante aggiornamento associazione delle coordinate:", err);
                return reject(new Error("Errore durante l'aggiornamento associazione delle coordinate."));            

              }
            });

            const updateCoordinatesQuery = `
              UPDATE Geolocation_Documents
              SET area_id = ?
              WHERE document_id = ?
            `;

            db.run(updateCoordinatesQuery, [newAreaId, document_id], function (err) {
              if (err) {
                console.error("Errore durante l'aggiornamento delle coordinate:", err);
                return reject(new Error("Errore durante l'aggiornamento delle coordinate."));
              }

              // Restituisce l'area_id e le nuove coordinate
              resolve({
                area_id: newAreaId,
                document_id: document_id
              });
            });

          });

        } else {

          // 2. Aggiorna le coordinate nella tabella Geolocation
          const updateCoordinatesQuery = `
            UPDATE Geolocation
            SET long = ?, lat = ?
            WHERE area_id = ?
          `;

          db.run(updateCoordinatesQuery, [long, lat, areaId], function (err) {
            if (err) {
              console.error("Errore durante l'aggiornamento delle coordinate:", err);
              return reject(new Error("Errore durante l'aggiornamento delle coordinate."));
            }

            // Restituisce l'area_id e le nuove coordinate
            resolve({
              area_id: areaId,
              long: long,
              lat: lat
            });
          });
        }
      });
    });
  }

  async updateDocumentArea(document_id, area_id) {
    return new Promise((resolve, reject) => {

      const updateCoordinatesQuery = `
      UPDATE Geolocation_Documents
      SET area_id = ?
      WHERE document_id = ?
    `;

      db.run(updateCoordinatesQuery, [area_id, document_id], function (err) {
        if (err) {
          console.error("Errore durante l'aggiornamento delle coordinate:", err);
          return reject(new Error("Errore durante l'aggiornamento delle coordinate."));
        }
        
        // Restituisce l'area_id e le nuove coordinate
        resolve({
          area_id: area_id,
          document_id: document_id
        });
      });

    });


  };

  async util_getStakeholdersIDs(stakeholders) {
    return new Promise((resolve, reject) => {
      const stakeholderIds = [];
      let processedCount = 0;
  
      const getStakeholderIdQuery = 'SELECT stakeholder_id FROM Stakeholders WHERE stakeholder_name = ?';
  
      for (const stakeholderName of stakeholders) {
        db.get(getStakeholderIdQuery, [stakeholderName], (err, row) => {
          if (err) {
            console.error("Errore durante il recupero dello stakeholder:", err);
            return reject(err);
          }
  
          if (row) {
            stakeholderIds.push(row.stakeholder_id);
          } else {
            console.log(`Nessun ID trovato per lo stakeholder: ${stakeholderName}`);
          }
  
          processedCount++;
  
          // Controlla se tutte le query sono state elaborate
          if (processedCount === stakeholders.length) {
            resolve(stakeholderIds);
          }
        });
      }
    });
  }

}

export default DocumentDAO;

