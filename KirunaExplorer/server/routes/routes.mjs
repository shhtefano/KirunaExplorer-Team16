import express from "express";
import DocumentDAO from "../dao/document-dao.mjs";

const router = express.Router();
const documentDAO = new DocumentDAO();

/*** DOCUMENT ROUTES ***/

router.post("/api/document", async (req, res) => {

  const { document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates } = req.body;
  try {
    // Step 1: Aggiungere il documento      
    await documentDAO.insertDocument(document_title, stakeholder, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates);

    res.status(201).send("Document successfully inserted");
  } catch (error) {
    if (error == 403)
      res.status(403).send("Document already exists");
    else if (error == 422)
      res.status(403).send("Missing Latitude/Longitude or Municipal area");
    else
      res.status(500).send("An error occurred while adding node and area.");
  }
});

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
  }
});

router.post("/api/document/update/georeference", async (req, res) => {
  const { markerId, lng, lat } = req.body;
  console.log(markerId, lng, lat, 'waaaa');
  
  try {
    console.log("received: ", markerId, lng, lat)
    await documentDAO.updatePointCoords(markerId, lng, lat);

    res.status(201).send("Georeference data successfully update");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating georeference of documents.");
  }
});

router.post("/api/document/updatePointCoords", async (req, res) => {
  const { document_id, lng, lat } = req.body;

  try {
    console.log("router:", document_id, lng, lat);

    const result = await documentDAO.updatePointCoordinates(document_id, lng, lat);

    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the point coordinates.' });
  }
});

router.put("/api/document/updateDocumentArea", async (req, res) => {
  const { document_id, area_id } = req.body;
  console.log(document_id, area_id);
  
  if (document_id === undefined || area_id === undefined) {
    console.log('se entro qua no');
    
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {

    const result = await documentDAO.updateDocumentArea(document_id, area_id);
    console.log('aoo', result);
    
    // res.status(200).send("Document area successfully updated");
    res.status(200).json({ message: "Document area successfully updated" });

  } catch (error) {
    console.log('qua è impossibile');
    
    console.error(error);
    res.status(500).send("An error occurred while updating the Document area.");
  }
});


export default router;
