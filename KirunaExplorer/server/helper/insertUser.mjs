import sqlite3 from "sqlite3";
import crypto from "crypto";

const db = new sqlite3.Database("../db/kirunadb.db");
const generateSalt = () => {
  return crypto.randomBytes(16).toString("hex");
};

const hashPassword = (password, salt) => {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("hex"));
    });
  });
};

const insertUser = async (username, role, password) => {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  const sql =
    "INSERT INTO Users (username, role, hashed_password, salt) VALUES (?, ?, ?, ?)";
  db.run(sql, [username, role, hash, salt], function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Un nuovo utente è stato inserito con l'id ${this.lastID}`);
  });
};

// Inserisci qui i dati dell'utente che vuoi aggiungere
const username = "resident";
const role = "resident";
const password = "resident";

insertUser(username, role, password);
