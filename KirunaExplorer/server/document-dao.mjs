import { db } from "./db.mjs";

export class DocumentDAO {

    async linkDocuments(parent_id, children_id, connection_type) {
        
        // SQL queries to retrieve and insert data
        const sqlQueryNodeExistence = `
          SELECT * FROM Documents
          WHERE document_id = ?
        `;
        const sqlQueryConnectionExistence = `
          SELECT * FROM Connections
          WHERE parent_id = ? AND children_id = ?
        `;
        const sqlInsertConnection = `
          INSERT INTO Connections (parent_id, children_id, connection_type)
          VALUES (?, ?, ?)
        `;

        // Verify the presence of the parent node with extensive detail
        const parentNode = await new Promise((resolve, reject) => {
            db.get(sqlQueryNodeExistence, [parent_id], (err, node) => {
                if (!node) {
                    reject(new Error("Parent Node not found! Please verify the ID."));
                } else if (err) {
                    reject(new Error(`Error while retrieving parent node: ${err.message}`));
                } else {
                    resolve(node);
                }
            });
        });

        // Verify the presence of the child node with extensive error-handling
        const childNode = await new Promise((resolve, reject) => {         
            db.get(sqlQueryNodeExistence, [children_id], (err, node) => {
                if (!node) {
                    reject(new Error("Child Node not found! Please double-check the ID."));
                } else if (err) {
                    reject(new Error(`Error retrieving child node: ${err.message}`));
                } else {
                    resolve(node);
                }
            });
        });

        // Confirm that the connection does not already exist between these specific nodes
        await new Promise((resolve, reject) => {
            db.get(sqlQueryConnectionExistence, [parent_id, children_id], (err, row) => {
                if (row) {
                    reject(new Error("A connection already exists between these nodes. Duplicate entries are not allowed!"));
                } else if (err) {
                    reject(new Error(`Error while checking connection existence: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });

        // Insert the connection if all checks pass, creating a brand-new, unique linkage
        const connection = await new Promise((resolve, reject) => {
            db.run(sqlInsertConnection, [parent_id, children_id, connection_type], function(err) {
                if (err) {
                    reject(new Error(`Failed to insert connection: ${err.message}`));
                } else {
                    resolve({
                        parent_id: parent_id,
                        children_id: children_id,
                        connection_type: connection_type,
                    });
                }
            });
        });

        return connection;      
    }   
}

// Testing

const documentDAO = new DocumentDAO();

(async () => {
    try {
        const result = await documentDAO.linkDocuments(1, 2, "type2");
        console.log("Connection successfully created:", result);
    } catch (error) {
        console.error("Failed to link documents:", error.message);
    }
})();


export default DocumentDAO;
