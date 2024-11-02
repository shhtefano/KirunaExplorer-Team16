import sqlite from 'sqlite3';

// Open the database
export const db = new sqlite.Database('db/kirunadb.db', (err) => {
  if (err) throw err;
});

db.serialize(() => {

  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      role TEXT,
      salt TEXT NOT NULL
    );
  `);

  // Connections Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Connections (
      parent_id INTEGER,
      children_id INTEGER,
      connection_type VARCHAR(50),
      PRIMARY KEY (parent_id, children_id),
      FOREIGN KEY (parent_id) REFERENCES Nodes(node_id),
      FOREIGN KEY (children_id) REFERENCES Nodes(node_id)
    );
  `);

  // Geolocation Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Geolocation (
      area_id INTEGER NOT NULL,
      long REAL NOT NULL,
      lat REAL NOT NULL,
      area_name TEXT NOT NULL DEFAULT ' '
    );
  `);

  // Documents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Documents (
      document_title VARCHAR(255) NOT NULL,
      stakeholder VARCHAR(100) NOT NULL,
      scale VARCHAR(50) NOT NULL,
      issuance_date DATE NOT NULL,
      connections INTEGER NOT NULL,
      language VARCHAR(50),
      pages INT,
      document_type VARCHAR(50) NOT NULL,
      document_description TEXT NOT NULL,
      document_id INTEGER PRIMARY KEY AUTOINCREMENT
    );
  `);

  // Geolocation_Documents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Geolocation_Documents (
      area_id INTEGER NOT NULL,
      document_id INTEGER NOT NULL,
      FOREIGN KEY(document_id) REFERENCES Nodes(node_id),
      FOREIGN KEY(area_id) REFERENCES Geolocation(area_id),
      PRIMARY KEY(area_id, document_id)
    );
  `);

  // Stakeholder Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Stakeholder (
      stakeholder_name TEXT,
      document_id INTEGER,
      FOREIGN KEY(stakeholder_name) REFERENCES Documents(document_id),
      PRIMARY KEY(stakeholder_name, document_id)
    );
  `);

  // Attachments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Attachments (
      file_name VARCHAR(255),
      document_id INTEGER NOT NULL,
      PRIMARY KEY(file_name, document_id)
    );
  `);

  // OriginalResources Table
  db.run(`
    CREATE TABLE IF NOT EXISTS OriginalResources (
      file_name VARCHAR(255) NOT NULL,
      document_id INTEGER NOT NULL,
      PRIMARY KEY(file_name, document_id)
    );
  `);

});