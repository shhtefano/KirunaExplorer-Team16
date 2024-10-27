import sqlite from 'sqlite3';

// Open the database
export const db = new sqlite.Database('kirunadb.db', (err) => {
  if (err) throw err;
});

db.serialize(() => {

  // Documents Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Documents (
      document_title VARCHAR(255) PRIMARY KEY,
      stakeholder VARCHAR(100),
      scale VARCHAR(50),
      issuance_date DATE,
      connections TEXT,
      language VARCHAR(50),
      pages INT
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

  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      username VARCHAR(100) PRIMARY KEY,
      hashed_password TEXT NOT NULL,
      role VARCHAR(50),
      salt TEXT NOT NULL
    )
  `);

  // Nodes Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Nodes (
      node_id INT PRIMARY KEY,
      node_type VARCHAR(50),
      document_description TEXT,
      document_title VARCHAR(255),
      FOREIGN KEY (document_title) REFERENCES Documents(document_title)
    )
  `);

  // Connections Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Connections (
      node1_id INT,
      node2_id INT,
      connection_type VARCHAR(50),
      PRIMARY KEY (node1_id, node2_id),
      FOREIGN KEY (node1_id) REFERENCES Nodes(node_id),
      FOREIGN KEY (node2_id) REFERENCES Nodes(node_id)
    )
  `);

  // Geolocation Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Geolocation (
      area_id INT,
      long REAL,
      lat REAL,
      node_id INT,
      PRIMARY KEY (area_id, node_id),
      FOREIGN KEY (node_id) REFERENCES Nodes(node_id)
    )
  `);

});
