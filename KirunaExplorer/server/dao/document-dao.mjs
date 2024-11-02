import { db } from '../db/db.mjs';

export const insertDocument = (document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description, area_name, coordinates) => {
    return new Promise((resolve, reject) => {
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
                    return reject(new Error('Documento già esistente.'));
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
                                if(coordinates.length >= 2 || coordinates.length === 0){
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
