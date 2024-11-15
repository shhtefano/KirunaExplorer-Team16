import express from "express";
import DocumentDAO from "../dao/document-dao.mjs";

const router = express.Router();
const documentDAO = new DocumentDAO();

/*** DOCUMENT ROUTES ***/

router.post("/api/document", async (req,res) => {
  
  const {document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates} = req.body;
  try {
      // Step 1: Aggiungere il documento      
      await documentDAO.insertDocument(document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates);
      
      res.status(201).send("Document successfully inserted");
  } catch (error) {
     if(error==403)
       res.status(403).send("Document already exists");
     else if (error==422)
      res.status(403).send("Missing Latitude/Longitude or Municipal area");
     else
      res.status(500).send("An error occurred while adding node and area.");   
  }});

  router.get("/api/document/list", async (req, res) => {
    try {
      // Recupera tutti i documenti dal database
      const documents = await documentDAO.getDocuments();
      
      // Risponde con i documenti in formato JSON
      res.status(200).json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching documents.");
    }
  });

  router.get("/api/document/geo/list", async (req, res) => {
    try {
      // Recupera tutti i documenti dal database
      const documents = await documentDAO.getDocumentsGeo();
      // Risponde con i documenti in formato JSON
      res.status(200).json(documents);
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching documents.");
    }
  });

router.post("/api/document/connections", async (req, res) => {
  const { parent_id, children_id, connection_type } = req.body;
  try {  
    console.log("router:", parent_id, children_id, connection_type)
      await documentDAO.linkDocuments(parent_id, children_id, connection_type);

      res.status(201).send("Documents successfully linked");
  } catch (error) { 
      console.error(error);
      res.status(500).send("An error occurred while linking the documents.");
}});

router.post("/api/document/updatePointCoords", async (req, res) => {
  const { document_id, long, lat } = req.body;

  try {
    console.log("router:", document_id, long, lat);

    const result = await documentDAO.updatePointCoords(document_id, long, lat);

    res.status(201).send("Point coordinates successfully updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the point coordinates.");
  }
});

router.put("/api/document/updateNodeArea", async (req, res) => {
  const { document_id, area_name } = req.body;

  if (!document_id || !area_name) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    console.log("router:", document_id, area_name);

    const result = await documentDAO.updateNodeArea(document_id, area_name);

    res.status(200).send("Node area successfully updated");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating the node area.");
  }
});


export default router;
