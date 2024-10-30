import { db } from '../db/db.mjs';

export const InsertDocument = (document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        
        db.run(sql, [document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

