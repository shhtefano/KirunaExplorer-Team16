import { db } from '../db/db.mjs';
import crypto from 'crypto';

export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        if (!row.hashed_password || !row.salt) {
          reject(new Error('Password or salt is missing from the database row'));
          return;
        }

        const user = { id: row.id, username: row.username, role: row.role };

        crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
          if (err) {
            reject(err);
            return;
          }

          if (!crypto.timingSafeEqual(Buffer.from(row.hashed_password, 'hex'), hashedPassword)) {
            resolve(false);
          } else {
            resolve(user);
          }
        });
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({ error: 'User not found!' });
      } else {
        const user = { id: row.id, username: row.username, role: row.role };
        resolve(user);
      }
    });
  });
};
