import sqlite from 'sqlite3';

// Open the database
export const db = new sqlite.Database('db/kirunadb.db', (err) => {
  if (err) throw err;
});
