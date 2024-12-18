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

        resolve(documents);
      });
    });
  }


  async deleteDocument(document_id) {
    return new Promise((resolve, reject) => {
      
      // Utilizziamo una transazione per garantire coerenza
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // Elimina i riferimenti nella tabella Geolocation_Documents
        db.run(
          `DELETE FROM Geolocation_Documents WHERE document_id = ?`,
          [document_id],
          function (err) {
            if (err) {
              console.error("Error deleting from Geolocation_Documents:", err);
              db.run("ROLLBACK");
              return reject(new Error("Error deleting geolocation references"));
            }
          }
        );
        
        // Elimina i riferimenti nella tabella Document_Stakeholder
        db.run(
          `DELETE FROM Document_Stakeholder WHERE document_id = ?`,
          [document_id],
          function (err) {
            if (err) {
              console.error("Error deleting from Document_Stakeholder:", err);
              db.run("ROLLBACK");
              return reject(new Error("Error deleting stakeholder references"));
            }
          }
        );
        
        // Elimina il documento dalla tabella Documents
        db.run(
          `DELETE FROM Documents WHERE document_id = ?`,
          [document_id],
          function (err) {
            if (err) {
              console.error("Error deleting document:", err);
              db.run("ROLLBACK");
              return reject(new Error("Error deleting the document"));
            }
            if (this.changes === 0) {
              db.run("ROLLBACK");
              return reject(new Error("Document not found"));
            }
            
            // Commit della transazione
            db.run("COMMIT", (err) => {
              if (err) {
                console.error("Error committing transaction:", err);
                return reject(new Error("Transaction commit failed"));
              }
              resolve({ message: "Document deleted successfully" });
            });
          }
        );
      });
    });
  }
  



  async getStakeholders() {
    return new Promise((resolve, reject) => {
      const query = `SELECT stakeholder_name FROM Stakeholders`;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Errore durante il recupero dei documenti:", err);
          return reject(new Error("Errore durante il recupero dei documenti."));
        }
        resolve(rows);
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

          // Aggiungi la coordinata corrente solo se non è duplicata o l'area è "Point-Based Documents"
          const area = documentsMap[docId].geolocations[areaId];
          if (
            row.area_name === "Point-Based Documents" &&
            area.coordinates.length === 0
          ) {
            // Se è "Point-Based Documents", aggiungi solo la prima coordinata
            area.coordinates.push({ long: row.long, lat: row.lat });
          } else if (row.area_name !== "Point-Based Documents") {
            // Altrimenti, aggiungi sempre la coordinata
            area.coordinates.push({ long: row.long, lat: row.lat });
          }
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

  async getAreaCoordinates(area_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          g.lat,
          g.long,
          g.n_order,
          g.sub_area_id -- Campo per identificare i sub-poligoni
        FROM 
          Geolocation g
        WHERE 
          g.area_id = ?
        ORDER BY 
          g.sub_area_id ASC, g.n_order ASC
      `;

      db.all(query, [area_id], (err, rows) => {
        if (err) {
          return reject(err); // Gestione errori
        }

        if (rows.length === 0) {
          return resolve(null); // Nessuna area trovata
        }

        // Raggruppa le coordinate per sub_area_id
        const coordinates = rows.reduce((acc, row) => {
          const subAreaId = row.sub_area_id || 0; // Default 0 se non ci sono sub-area
          if (!acc[subAreaId]) {
            acc[subAreaId] = [];
          }
          acc[subAreaId].push({ lat: row.lat, lng: row.long });
          return acc;
        }, {});

        // Converte l'oggetto in un array di array
        const multiPolygonCoordinates = Object.values(coordinates).map((coords) => {
          // Chiude ogni poligono se necessario
          if (
            coords.length > 0 &&
            (coords[0].lat !== coords[coords.length - 1].lat ||
              coords[0].lng !== coords[coords.length - 1].lng)
          ) {
            coords.push(coords[0]); // Chiudi il poligono
          }
          return coords;
        });


        // Restituisci solo le coordinate
        resolve(multiPolygonCoordinates);
      });
    });
  }

  async getDocumentPosition(document_id) {
    return new Promise((resolve, reject) => {
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
          g.area_name,
          g.n_order,
          g.sub_area_id -- Nuovo campo per identificare i sub-poligoni
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
        ORDER BY 
          g.sub_area_id ASC, g.n_order ASC
      `;

      db.all(query, [document_id], (err, rows) => {
        if (err) {
          return reject(err); // Gestione errori
        }

        if (rows.length === 0) {
          return resolve(null); // Documento non trovato
        }

        // Estrai informazioni comuni del documento
        const documentInfo = {
          document_id: rows[0].document_id,
          document_title: rows[0].document_title,
          scale: rows[0].scale,
          issuance_date: rows[0].issuance_date,
          language: rows[0].language,
          pages: rows[0].pages,
          document_type: rows[0].document_type,
          document_description: rows[0].document_description,
          area_name: rows[0].area_name,
        };

        // Raggruppa le coordinate per sub_area_id
        const coordinates = rows.reduce((acc, row) => {
          const subAreaId = row.sub_area_id || 0; // Default 0 se non ci sono sub-area
          if (!acc[subAreaId]) {
            acc[subAreaId] = [];
          }
          acc[subAreaId].push({ lat: row.lat, lng: row.long });
          return acc;
        }, {});

        // Converte l'oggetto in un array di array
        const multiPolygonCoordinates = Object.values(coordinates).map((coords) => {
          // Chiude ogni poligono se necessario
          if (
            coords.length > 0 &&
            (coords[0].lat !== coords[coords.length - 1].lat ||
              coords[0].lng !== coords[coords.length - 1].lng)
          ) {
            coords.push(coords[0]); // Chiudi il poligono
          }
          return coords;
        });        

        // Restituisci il risultato
        resolve({
          ...documentInfo,
          coordinates: multiPolygonCoordinates, // Multipoligono
        });
      });
    });
  }

  async addArea(area) {
    return new Promise((resolve, reject) => {
      // Controlla che le coordinate siano valide
      if (!area || area.length === 0 || !area.every(coord => coord.long && coord.lat)) {
        return reject({ code: 422, message: "Missing or invalid latitude/longitude." });
      }

      const areaName = area[0]?.area_name;
      if (!areaName) {
        return reject({ code: 422, message: "Missing area name." });
      }

      // Controlla se il nome dell'area esiste già
      db.get("SELECT 1 FROM Geolocation WHERE area_name = ?", [areaName], (err, row) => {
        if (err) {
          return reject({ code: 500, message: `Database error: ${err.message}` });
        }

        if (row) {
          return reject({ code: 403, message: "Area name already exists." });
        }

        // Trova l'area_id massimo
        db.get("SELECT MAX(area_id) as maxAreaId FROM Geolocation", (err, row) => {
          if (err) {
            return reject({ code: 500, message: `Database error: ${err.message}` });
          }

          const newAreaId = (row && row.maxAreaId !== null) ? row.maxAreaId + 1 : 1;

          // Prepara i dati per l'inserimento
          const placeholders = area.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
          const query = `
                    INSERT INTO Geolocation (area_id, long, lat, area_name, n_order, sub_area_id)
                    VALUES ${placeholders}
                `;

          const values = area.flatMap(({ long, lat, area_name, n_order, sub_area_id }) => [
            newAreaId, long, lat, area_name, n_order, sub_area_id
          ]);

          // Esegui l'inserimento
          db.run(query, values, function (err) {
            if (err) {
              return reject({ code: 500, message: `Database error: ${err.message}` });
            }
            resolve({ message: "Area added successfully.", area_id: newAreaId });
          });
        });
      });
    });
  }

  async insertDocument(document_title, stakeholders, scale, issuance_date, language, pages, document_type, document_description, area_name, coords) {
    //Converting stakeholder names to stakeholderIds
    let stakeholderIds = [];

    stakeholderIds = await this.util_getStakeholdersIDs(stakeholders);

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
                db.run(insertDocumentStakeholderQuery, [stakeholder, document_id], function (err) {
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
              WHERE parent_id = ? AND children_id = ? AND connection_type = ?
            `;
    const sqlQueryInverseConnectionExistence = `
              SELECT * FROM Connections
              WHERE parent_id = ? AND children_id = ? AND connection_type = ?
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
      db.get(sqlQueryConnectionExistence, [parent_id, children_id, connection_type], (err, row) => {
        if (row) {
          reject(new Error("Duplicated link"));
        } else if (err) {
          reject(new Error(`Error while checking connection existence: ${err.message}`));
        } else {
          resolve();
        }
      });
    });

    // Confirm that the inverse connection does not already exist (to prevent duplicate connections in reverse order)
    await new Promise((resolve, reject) => {
      db.get(sqlQueryInverseConnectionExistence, [children_id, parent_id, connection_type], (err, row) => {
        if (row) {
          reject(new Error("Duplicated link"));
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

  async getConnectionsByDocumentTitle(title) {
    return new Promise((resolve, reject) => {
      const sqlQueryConnections = `
        SELECT 
          parent_id,
          children_id ,
          connection_type
        FROM 
          Connections
        WHERE 
          parent_id = ? OR children_id = ?
      `;

      db.all(sqlQueryConnections, [title, title], (err, rows) => {
        if (err) {
          console.error("Errore durante il recupero delle connessioni:", err);
          return reject(new Error("Errore durante il recupero delle connessioni."));
        }
        resolve(rows);
      });
    });
  }

  async deleteConnection(doc1_id, doc2_id, connection_type) {
    return new Promise((resolve, reject) => {
      const sqlQueryDelete = `
        DELETE FROM connections
        WHERE 
          (parent_id = ? AND children_id = ? AND connection_type = ?)
          OR (children_id = ? AND parent_id = ? AND connection_type = ?)
      `;

      db.run(sqlQueryDelete, [doc1_id, doc2_id, connection_type, doc1_id, doc2_id, connection_type], function (err) {
        if (err) {
          console.error("Errore durante la cancellazione delle connessioni:", err);
          return reject(new Error("Errore durante la cancellazione delle connessioni"));
        }

        // Se rows è 0, la connessione non esiste
        if (this.changes === 0) {
          console.log("Nessuna connessione trovata con questi parametri.");
          return reject(new Error("Connessione non trovata"));
        }

        resolve("Connessione eliminata con successo.");
      });
    });
  }

  async getAreas() {
    return new Promise((resolve, reject) => {
      const sqlQuery = `
            SELECT DISTINCT
                area_id AS id,
                area_name AS name,
                lat AS latitude,
                long AS longitude,
                n_order,
                sub_area_id
            FROM 
                Geolocation
            WHERE 
                area_name != 'Point-Based Documents'
            ORDER BY 
                area_id, sub_area_id, n_order
        `;

      db.all(sqlQuery, (err, rows) => {
        if (err) {
          console.error("Errore durante il recupero delle aree:", err);
          return reject(new Error("Errore durante il recupero delle aree."));
        }

        // Mappa per organizzare le aree per id e sub_area_id
        const areasMap = new Map();

        rows.forEach(row => {
          if (!areasMap.has(row.id)) {
            areasMap.set(row.id, {
              id: row.id,
              name: row.name,
              latlngs: row.sub_area_id === null ? [] : {}, // Usa un array per poligoni semplici, oggetto per multipoligoni
            });
          }

          const area = areasMap.get(row.id);

          if (row.latitude !== null && row.longitude !== null) {
            if (row.sub_area_id === null) {
              // Poligono semplice
              area.latlngs.push({ lat: row.latitude, lng: row.longitude });
            } else {
              // Multipoligono
              if (!area.latlngs[row.sub_area_id]) {
                area.latlngs[row.sub_area_id] = [];
              }
              area.latlngs[row.sub_area_id].push({ lat: row.latitude, lng: row.longitude });
            }
          }
        });

        // Converti la mappa in un array
        let areas = Array.from(areasMap.values()).map(area => {
          // Per i multipoligoni, converti latlngs (oggetto) in un array
          if (typeof area.latlngs === 'object' && !Array.isArray(area.latlngs)) {
            area.latlngs = Object.values(area.latlngs).filter(Boolean); // Rimuove eventuali "buchi"
          }
          return area;
        });

        // Rimuovi duplicati basati sul nome dell'area
        const seenNames = new Set();
        areas = areas.filter(area => {
          if (seenNames.has(area.name)) {
            return false; // Escludi area se il nome è già visto
          }
          seenNames.add(area.name);
          return true;
        });

        areas.push({ id: 0, name: "Point-Based Documents", latlngs: [] });

        // console.log("Aree recuperate:", areas);

        resolve(areas);
      });
    });
  }

  async getAreaIdByDocumentId(document_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT GD.area_id
        FROM Geolocation_Documents GD
        WHERE GD.document_id = ?;
      `;

      db.get(query, [document_id], (err, row) => {
        if (err) {
          console.error("Errore durante il recupero dell'area_id:", err);
          return reject(new Error("Errore durante il recupero dell'area_id."));
        }

        if (row) {
          resolve(row.area_id); // Restituisce l'area_id
        } else {
          reject(new Error("Nessuna area associata a questo document_id"));
        }
      });
    });
  }


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
        if (areaId === 1) {
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
              if (err) {
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
      const selectQuery = 'SELECT area_name FROM Geolocation WHERE area_id = ?';


      db.run(selectQuery, [area_id], function (err, rows) {
        if (err) {
          console.error("Errore durante l'aggiornamento delle coordinate:", err);
          return reject(new Error("Errore durante l'aggiornamento delle coordinate."));
        }


        if (rows === 'Point-Based Documents') {

          const deleteQuery = `
                DELETE FROM Geolocation_Documents
                WHERE area_id = ?
              `;

          db.run(deleteQuery, [area_id], function (err) {
            if (err) {
              console.error("Errore durante l'aggiornamento delle coordinate:", err);
              return reject(new Error("Errore durante l'aggiornamento delle coordinate."));
            }

            resolve({ area_name });
          });



        }

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

  async util_insertStakeholder(stakeholder_name) {
    return new Promise((resolve, reject) => {
      const checkStakeholderQuery = `
        SELECT stakeholder_id FROM Stakeholders
        WHERE stakeholder_name = ?
      `;

      const insertStakeholderQuery = `
        INSERT INTO Stakeholders (stakeholder_name)
        VALUES (?)
      `;

      db.get(checkStakeholderQuery, [stakeholder_name], (err, row) => {
        if (err) {
          console.error("Errore durante la verifica dello stakeholder:", err);
          return reject(new Error("Errore durante la verifica dello stakeholder."));
        }

        if (row) {
          return resolve({
            stakeholder_id: row.stakeholder_id,
            stakeholder_name: stakeholder_name
          });
        }

        db.run(insertStakeholderQuery, [stakeholder_name], function (err) {
          if (err) {
            console.error("Errore durante l'inserimento dello stakeholder:", err);
            return reject(new Error("Errore durante l'inserimento dello stakeholder."));
          }
          resolve({
            stakeholder_id: this.lastID,
            stakeholder_name: stakeholder_name
          });
        });
      });
    });
  }
  


  async getDocumentTypes() {
    return new Promise((resolve, reject) => {
      const query = `SELECT type_name FROM Type`;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error retrieving document types:", err);
          return reject(new Error("Error retrieving document types."));
        }
        if (rows) {
          resolve(rows); 
        } else {
          reject(new Error("No document types found."));
        }
      });
    });
  }

async  addDocumentType(typeName) {
  return new Promise((resolve, reject) => {
    // Check if the document type already exists
    const checkQuery = `SELECT * FROM Type WHERE type_name = ?`;

    db.get(checkQuery, [typeName], (err, row) => {
      if (err) {
        console.error("Error checking document type:", err);
        return reject(new Error("Error checking document type."));
      }

      if (row) {
        // Reject the promise if the type already exists
        return reject(new Error("Document type already exists"));
      }

      // Insert the new document type
      const query = `INSERT INTO Type (type_name) VALUES (?);`;

      db.run(query, [typeName], function (err) {
        if (err) {
          console.error("Error adding document type:", err);
          return reject(new Error("Error adding document type."));
        }

        // Resolve with the newly added document type
        resolve({ type_id: this.lastID, type_name: typeName });
      });
    });
  });
}

  async deleteArea(areaName) {
    return new Promise((resolve, reject) => {
      if(areaName === 'Kiruna Map') {
        return reject (new Error("Cannot delete Kiruna Map"));
      }
      const findAreaQuery = `SELECT area_id FROM Geolocation WHERE area_name = ?`;
      const updateDocumentsQuery = `
        UPDATE Geolocation_Documents
        SET area_id = (SELECT area_id FROM Geolocation WHERE area_name = 'Kiruna Map')
        WHERE area_id = ?
      `;
      const deleteAreaQuery = `DELETE FROM Geolocation WHERE area_id = ?`;

      db.get(findAreaQuery, [areaName], (err, row) => {
        if (err) {
          console.error("Errore durante la ricerca dell'area:", err);
          return reject(new Error("Errore durante la ricerca dell'area"));
        }

        const areaId = row.area_id;

        db.run(updateDocumentsQuery, [areaId], function (err) {
          if (err) {
            console.error("Errore durante l'aggiornamento dei documenti:", err);
            return reject(new Error("Errore durante l'aggiornamento dei documenti"));
          }

          db.run(deleteAreaQuery, [areaId], function (err) {
            if (err) {
              console.error("Errore durante la cancellazione dell'area:", err);
              return reject(new Error("Errore durante la cancellazione dell'area"));
            }

            resolve("Area eliminata con successo.");
          });
        });
      });
    });
    
  }


  async updateDocument(body) {
    return new Promise((resolve, reject) => {
      console.log("Body ricevuto per update:", body);
      const { oldTitle: oldTitle, document_title: title, document_type: type, issuance_date: date, document_description: description, scale: scale, language: language, pages: pages, stakeholders: stakeholders } = body;
      console.log("Valori ricevuti:", title, type, date, description, scale, language, pages, stakeholders);
      
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
  
        // Verifica se esiste già un documento con lo stesso titolo
        const checkDocumentQuery = `SELECT * FROM Documents WHERE document_title = ?;`;
        db.get(checkDocumentQuery, [title], (err, row) => {
          if (err) {
            console.error("Error checking if document title exists:", err);
            db.run("ROLLBACK");
            return reject(new Error("Error checking if document title exists."));
          }

          if(oldTitle !== title)
          {if (row) {
            console.error("A document with the same title already exists.");
            db.run("ROLLBACK");
            return reject(new Error("A document with the same title already exists."));
          }}
  
          // Se non esiste, procedi con l'aggiornamento
          // Query per aggiornare i campi nella tabella Documents
          const documentQuery = `
            UPDATE Documents
            SET 
              document_title = ?,
              document_type = ?,
              issuance_date = ?,
              document_description = ?,
              scale = ?,
              language = ?,
              pages = ?
            WHERE document_title = ?;
          `;
  
          db.run(
            documentQuery,
            [title, type, date, description, scale, language, pages, oldTitle],
            (err) => {
              if (err) {
                console.error("Error updating document fields:", err);
                db.run("ROLLBACK");
                return reject(new Error("Error updating document fields."));
              }
  
              console.log("Document updated successfully.", title);
              // Recupera l'ID del documento aggiornato
              this.getDocumentById(title)
                .then((documentId) => {
                  if (!documentId) {
                    db.run("ROLLBACK");
                    return reject(new Error("Document ID not found."));
                  }
  
                  const actualDocumentId = documentId.document_id;
  
                  // Rimuove le associazioni precedenti con gli stakeholder
                  const deleteStakeholdersQuery = `DELETE FROM Document_Stakeholder WHERE document_id = ?;`;
                  db.run(deleteStakeholdersQuery, [actualDocumentId], (err) => {
                    if (err) {
                      console.error("Error removing previous stakeholders:", err);
                      db.run("ROLLBACK");
                      return reject(new Error("Error removing previous stakeholders."));
                    }
  
                    // Inserisce i nuovi stakeholder
                    if (stakeholders && stakeholders.length > 0) {
                      const insertStakeholdersQuery = `
                        INSERT INTO Document_Stakeholder (document_id, stakeholder_id) 
                        VALUES (?, (SELECT stakeholder_id FROM Stakeholders WHERE stakeholder_name = ?));
                      `;
  
                      const insertPromises = stakeholders.map((stakeholderName) => {
                        return new Promise((resolveStakeholder, rejectStakeholder) => {
                          db.run(insertStakeholdersQuery, [actualDocumentId, stakeholderName], (err) => {
                            if (err) {
                              console.error("Error inserting stakeholder:", err);
                              return rejectStakeholder(new Error("Error inserting stakeholders"));
                            }
                            resolveStakeholder();
                          });
                        });
                      });
  
                      Promise.all(insertPromises)
                        .then(() => {
                          db.run("COMMIT");
                          resolve("Document updated successfully.");
                        })
                        .catch((err) => {
                          console.error("Error during stakeholder insertion:", err);
                          db.run("ROLLBACK");
                          reject(err);
                        });
                    } else {
                      db.run("COMMIT");
                      resolve("Document updated successfully (no stakeholders).");
                    }
                  });
                })
                .catch((err) => {
                  console.error("Error fetching document ID:", err);
                  db.run("ROLLBACK");
                  reject(err);
                });
            }
          );
        });
      });
    });
  }
  
  



 // Metodo per recuperare un documento tramite il suo ID
 async getDocumentByTitle(document_id) {
  return new Promise((resolve, reject) => {
    // Query per recuperare i dettagli del documento
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
      JOIN Stakeholders S ON DS.stakeholder_id = S.stakeholder_id
      WHERE D.document_title = ?;
    `;

    // Esegui la query con il document_id passato
    db.all(query, [document_id], (err, rows) => {
      if (err) {
        console.error("Errore durante il recupero del documento:", err);
        return reject(new Error("Errore durante il recupero del documento."));
      }

      if (rows.length === 0) {
        return resolve(null); // Se non troviamo il documento, restituiamo null
      }

      // Raggruppa i dati del documento
      const document = {
        document_id: rows[0].document_id,
        document_title: rows[0].document_title,
        scale: rows[0].scale,
        issuance_date: rows[0].issuance_date,
        language: rows[0].language,
        pages: rows[0].pages,
        document_type: rows[0].document_type,
        document_description: rows[0].document_description,
        stakeholders: [], // Inizializza l'array degli stakeholder
      };

      // Aggiungi gli stakeholder al documento
      rows.forEach(row => {
        document.stakeholders.push(row.stakeholder_name);
      });

      // Restituisci il documento
      resolve(document);
    });
  });

}
// Metodo per eliminare un link dato parent_id, child_id e connection_type
async deleteLink(parentId, childId, connectionType) {
  return new Promise((resolve, reject) => {
    // Query per eliminare il link (prima combinazione)
    const query1 = `
      DELETE FROM Connections
      WHERE parent_id = ? AND children_id = ? AND connection_type = ?;
    `;
    // Query per eliminare il link (seconda combinazione)
    const query2 = `
      DELETE FROM Connections
      WHERE parent_id = ? AND children_id = ? AND connection_type = ?;
    `;

    // Esegui la prima query
    db.run(query1, [parentId, childId, connectionType], function (err) {
      if (err) {
        console.error("Errore durante l'eliminazione del link (prima combinazione):", err);
        return reject(new Error("Errore durante l'eliminazione del link (prima combinazione)."));
      }

      // Se non è stata eliminata nessuna riga nella prima query, esegui la seconda
      if (this.changes === 0) {
        db.run(query2, [childId, parentId, connectionType], function (err) {
          if (err) {
            console.error("Errore durante l'eliminazione del link (seconda combinazione):", err);
            return reject(new Error("Errore durante l'eliminazione del link (seconda combinazione)."));
          }

          // Controlla se è stata eliminata una riga nella seconda query
          if (this.changes === 0) {
            return resolve(false); // Nessun link eliminato
          }

          resolve(true); // Link eliminato con successo
        });
      } else {
        resolve(true); // Link eliminato con successo nella prima query
      }
    });
  });
}


// Metodo per recuperare un documento tramite il suo ID
async getDocumentById(document_title) {
  return new Promise((resolve, reject) => {
    console.log("Ricerca del documento con ID:", document_title);
    const query = `
      SELECT document_id
      FROM Documents
      WHERE document_title = ?;
    `;

    db.get(query, [document_title], (err, row) => {
      if (err) {
        console.error("Errore durante il recupero del documento:", err);
        return reject(new Error("Errore durante il recupero del documento."));
      }
      console.log("Risultato della query getDocumentById:", row); // Debug

      resolve(row); // Restituisci solo l'ID
    });
  });
}

async getDocumentById(document_title) {
  return new Promise((resolve, reject) => {
    console.log("Ricerca del documento con ID:", document_title);
    const query = `
      SELECT document_id
      FROM Documents
      WHERE document_title = ?;
    `;

    db.get(query, [document_title], (err, row) => {
      if (err) {
        console.error("Errore durante il recupero del documento:", err);
        return reject(new Error("Errore durante il recupero del documento."));
      }
      console.log("Risultato della query getDocumentById:", row); // Debug

      resolve(row); // Restituisci solo l'ID
    });
  });
}

async updateAreaName(area_id, new_area_name) {
  return new Promise((resolve, reject) => {
    console.log("Updating area with ID:", area_id);

    // Verifica se esiste già un'area con il nuovo nome
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM Geolocation
      WHERE area_name = ? AND area_id != ?;
    `;
    
    db.get(checkQuery, [new_area_name, area_id], (err, row) => {
      if (err) {
        console.error("Error checking area name:", err);
        return reject(new Error("Error checking area name"));
      }

      if (row.count > 0) {
        // Se esiste già un'area con lo stesso nome, ritorna un errore 409
        return reject(new Error("The area name is already in use. Please choose a different name."));
      }

      // Prepara la query per aggiornare il nome dell'area
      const query = `
        UPDATE Geolocation
        SET area_name = ?
        WHERE area_id = ?;
      `;

      // Esegui la query di aggiornamento
      db.run(query, [new_area_name, area_id], function (err) {
        if (err) {
          console.error("Error updating area name:", err);
          return reject(new Error("Error updating area name"));
        }

         else {
          resolve({ success: true, message: "Area name updated successfully." });
        }
      });
    });
  });
}







async getAreaNameByDocumentId(document_id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT G.area_name
      FROM Geolocation G
      INNER JOIN Geolocation_Documents GD ON G.area_id = GD.area_id
      WHERE GD.document_id = ?;
    `;

    db.get(query, [document_id], (err, row) => {
      if (err) {
        console.error("Error retrieving area name:", err);
        return reject(new Error("Error retrieving area name."));
      }

      if (row && row.area_name) {
        resolve(row.area_name); 
      } else {
        reject(new Error("No area name associated with this document_id."));
      }
    });
  });
}







}


export default DocumentDAO;

