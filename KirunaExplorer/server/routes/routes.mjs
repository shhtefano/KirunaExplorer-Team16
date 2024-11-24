import express from "express";
import DocumentDAO from "../dao/document-dao.mjs";

const router = express.Router();
const documentDAO = new DocumentDAO();

/*** DOCUMENT ROUTES ***/

router.post("/api/document", async (req, res) => {

  const { document_title, stakeholders, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates } = req.body;
  try {
    // Step 1: Aggiungere il documento      
    await documentDAO.insertDocument(document_title, stakeholders, scale, issuance_date, language, pages, document_type, document_description, area_name, coordinates);

    res.status(201).send("Document successfully inserted");
  } catch (error) {
    if (error == 403)
      res.status(403).send("Document already exists");
    else if (error == 422)
      res.status(422).send("Missing Latitude/Longitude or Municipal area");
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

router.get("/api/stakeholder", async (req, res) => {
  try {
    // Recupera tutti i documenti dal database
    const stakeholders = await documentDAO.getStakeholders();
    // Risponde con i documenti in formato JSON
    res.status(200).json(stakeholders);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching documents.");
  }
});

router.get("/api/document/:document_id/geo/", async (req, res) => {
  try {
    // Recupera tutti i documenti dal database
    const document = await documentDAO.getDocumentPosition(req.params.document_id);
    // Risponde con i documenti in formato JSON
    res.status(200).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching document position.");
  }
});

router.post("/api/stakeholder", async (req, res) => {
  console.log('salame');
  
  try {
    console.log('miaooo',req.body);
    
    await documentDAO.util_insertStakeholder(req.body.stakeholder_name);

    res.status(201).send("Stakeholder successfully inserted");
  } catch (error) {
    console.error(error);
    if(error === "Duplicated stakeholder"){
      res.status(403).send("Duplicated stakeholder"); //CHANGED ERROR MESSAGE

    }else{

      res.status(500).send(error.message); //CHANGED ERROR MESSAGE
    }
  }
});

router.post("/api/document/connections", async (req, res) => {
  const { parent_id, children_id, connection_type } = req.body;
  try {
    await documentDAO.linkDocuments(parent_id, children_id, connection_type);

    res.status(201).send("Documents successfully linked");
  } catch (error) {
    console.error(error);
    if(error === "Duplicated link"){
      res.status(403).send("Duplicated Link"); //CHANGED ERROR MESSAGE

    }else{

      res.status(500).send(error.message); //CHANGED ERROR MESSAGE
    }
  }
});

router.post("/api/document/update/georeference", async (req, res) => {
  const { markerId, lng, lat } = req.body;
  
  try {
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

    const result = await documentDAO.updatePointCoordinates(document_id, lng, lat);

    res.status(201).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the point coordinates.' });
  }
});

router.put("/api/document/updateDocumentArea", async (req, res) => {
  const { document_id, area_id } = req.body;
  
  if (document_id === undefined || area_id === undefined) {    
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {

    const result = await documentDAO.updateDocumentArea(document_id, area_id);
    
    res.status(200).json({ message: "Document area successfully updated" });

  } catch (error) {
    
    console.error(error);
    res.status(500).send("An error occurred while updating the Document area.");
  }
});


export default router;
