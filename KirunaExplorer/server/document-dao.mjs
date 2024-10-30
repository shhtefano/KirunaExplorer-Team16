import { db } from "./db.mjs";

export class DocumentDAO {

    async linkDocuments(parent_id,children_id,connection_type) {

        const sqlQuery0 = `
          SELECT * FROM Nodes
          WHERE node_id = ?
        `;
        const sqlQuery1 = `
          SELECT * FROM Connections
          WHERE parent_id = ? AND children_id = ? AND connection_type = ?
        `;
        const sqlQuery2 = "INSERT INTO Connections (parent_id,children_id,connection_type) VALUES (?,?,?)";


        //Check on parent_title
        const parent = await new Promise((resolve,reject) => {
            db.get(sqlQuery0,[parent_id], (err,node) => {
                if (!node) {
                    const err = "Parent Node not found";
                    reject(new Error (err));
                  } else if (err) {
                    reject(err);
                  } else {
                    resolve(node);
                  }
            })
        })

        // Check on children_id
        const children = await new Promise((resolve, reject) => {         
            db.get(sqlQuery0, [children_id], (err, node) => {
                if (err) {
                    reject(new Error("Error retrieving children node: " + err.message));
                } else if (!node) {
                    reject(new Error("Children Node not found"));
                } else {
                    resolve(node);
                }
            });
        });

        //I have to understand better this condition
        //Check if the connection is not already there (Same parent_title,children_title and type)
         await new Promise((resolve, reject) => {
            db.get(sqlQuery1, [parent_id, children_id, connection_type], (err, row) => {
              if (err) {
                reject(err); 
              } else if (row) {
                const err = "A connection already exists between these nodes with the specified type";
                reject(new Error (err));
              } else {
                resolve();
              }
            });
          });
          

          const connection = await new Promise((resolve, reject) => {
            db.run(sqlQuery2, [parent_id,children_id,connection_type], function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({
                  parent_id: this.parent_id,
                  children_id: this.children_id_id,
                  connection_type: this.connection_type,
                });
              }
            });
          });      
      }   
}


//Testing
/*
const documentDAO = new DocumentDAO();

(async () => {
    try {
        const result = await documentDAO.linkDocuments(1, 2, "type2");
        console.log("Connection successfully created:", result);
    } catch (error) {
        console.error("Failed to link documents:", error.message);
    }
})();
*/



export default DocumentDAO;