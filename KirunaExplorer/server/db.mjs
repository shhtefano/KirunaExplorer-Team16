import sqlite from 'sqlite3';

// Open the database
export const db = new sqlite.Database('kirunadb.db', (err) => {
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
    )
  `);

  // Documents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Documents (
      document_title VARCHAR(255) PRIMARY KEY,
      stakeholder VARCHAR(100),
      scale VARCHAR(50),
      issuance_date DATE,
      connections INTEGER,
      language VARCHAR(50),
      pages INT,
      document_type VARCHAR(50),
      document_description TEXT
    )
  `);

  // Attachments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Attachments (
      file_name VARCHAR(255) PRIMARY KEY,
      document_title VARCHAR(255),
      FOREIGN KEY (document_title) REFERENCES Documents(document_title)
    )
  `);

  // Original Resources Table
  db.run(`
    CREATE TABLE IF NOT EXISTS OriginalResources (
      file_name VARCHAR(255) PRIMARY KEY,
      document_title VARCHAR(255),
      FOREIGN KEY (document_title) REFERENCES Documents(document_title)
    )
  `);

  // Nodes Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Nodes (
      node_id INTEGER PRIMARY KEY,
      document_title VARCHAR(255),
      document_description TEXT,
      document_type VARCHAR(50),
      FOREIGN KEY (document_title) REFERENCES Documents(document_title),
      FOREIGN KEY (document_description) REFERENCES Documents(document_description),
      FOREIGN KEY (document_type) REFERENCES Documents(document_type)
    )
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
    )
  `);

  // Geolocation Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Geolocation (
      area_id INTEGER PRIMARY KEY,
      long REAL,
      lat REAL
    )
  `);

  // Geolocation_Nodes Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Geolocation_Nodes (
      area_id INTEGER,
      node_id INTEGER,
      PRIMARY KEY (area_id, node_id),
      FOREIGN KEY (area_id) REFERENCES Geolocation(area_id),
      FOREIGN KEY (node_id) REFERENCES Nodes(node_id)
    )
  `);

});
