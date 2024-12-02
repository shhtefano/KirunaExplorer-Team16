import fs from 'fs';
import sqlite from 'sqlite3';

// Inizializza il database
export const db = new sqlite.Database('./kirunadb.db', (err) => {
  if (err) {
    console.error('Errore durante l\'apertura del database:', err);
    throw err;
  }
  console.log('Database aperto con successo.');
});

// Esegui query SQL dal file
const executeSqlFile = (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const queries = sql.split(';').map(query => query.trim()).filter(query => query.length > 0);

    db.serialize(() => {
      queries.forEach((query) => {
        db.run(query, (err) => {
          if (err) {
            console.error(`Errore durante l'esecuzione della query: ${query}`, err);
          } else {
            console.log(`Query OK.`);
          }
        });
      });
    });
  } catch (err) {
    console.error('Errore durante la lettura del file SQL:', err);
    throw err;
  }
};

// Inserisci i dati dal GeoJSON
const insertGeoJsonData = (geoJsonPath) => {
  try {
    const geoJson = JSON.parse(fs.readFileSync(geoJsonPath, 'utf-8'));
    const areaName = 'Kiruna Map';
    let areaId = 0; // Inizializza area_id, incrementalo per ogni nuova area
    let subAreaId = 0; // Identifica i sub-poligoni per multipoligoni

    db.serialize(() => {
      geoJson.features.forEach((feature) => {
        if (feature.geometry.type === 'MultiPolygon') {
          // Incrementa areaId per ogni nuova feature
          areaId += 1;

          feature.geometry.coordinates.forEach((polygon) => {
            // Incrementa subAreaId per ogni poligono in un multipoligono
            subAreaId += 1;
            let n_order = 0;

            polygon[0].forEach(([long, lat]) => {
              n_order += 1;
              db.run(
                'INSERT INTO Geolocation (area_id, sub_area_id, long, lat, area_name, n_order) VALUES (?, ?, ?, ?, ?, ?)',
                [areaId, subAreaId, long, lat, areaName, n_order],
                (err) => {
                  if (err) {
                    console.error('Errore durante l\'inserimento:', err);
                  }
                }
              );
            });
          });
        } else if (feature.geometry.type === 'Polygon') {
          // Gestione dei poligoni singoli
          areaId += 1;
          let n_order = 0;

          feature.geometry.coordinates[0].forEach(([long, lat]) => {
            n_order += 1;
            db.run(
              'INSERT INTO Geolocation (area_id, sub_area_id, long, lat, area_name, n_order) VALUES (?, ?, ?, ?, ?, ?)',
              [areaId, null, long, lat, areaName, n_order], // sub_area_id è null per i poligoni singoli
              (err) => {
                if (err) {
                  console.error('Errore durante l\'inserimento:', err);
                }
              }
            );
          });
        } else {
          console.warn('Tipo di geometria non supportato:', feature.geometry.type);
        }
      });
    });

    console.log('Dati inseriti con successo!');
  } catch (err) {
    console.error('Errore durante il caricamento del GeoJSON:', err);
    throw err;
  }
};


// Esegui le operazioni
db.serialize(() => {
  const sqlFilePath = './setup.sql'; // Percorso del file .sql
  const geoJsonPath = './KirunaMunicipality.geojson'; // Percorso del file GeoJSON

  // 1. Esegui le query dal file SQL
  executeSqlFile(sqlFilePath);
  // 2. Inserisci i dati dal file GeoJSON
  insertGeoJsonData(geoJsonPath);


  // Chiudi il database
  db.close((err) => {
    if (err) {
      console.error('Errore durante la chiusura del database:', err);
    } else {
      console.log('Database chiuso correttamente.');
    }
  });
});
