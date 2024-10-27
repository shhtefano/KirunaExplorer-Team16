import { db } from './db.mjs';
import crypto from 'crypto';

export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        //console.log('Retrieved row:', row);
        if (!row.hash || !row.salt) {
          reject(new Error('Password or salt is missing from the database row'));
          return;
        }

        const user = { id: row.id, username: row.email, name: row.name };

        crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
          if (err) {
            reject(err);
            return;
          }

          if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
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
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({ error: 'User not found!' });
      } else {
        const user = { id: row.id, username: row.email, name: row.name };
        resolve(user);
      }
    });
  });
};
