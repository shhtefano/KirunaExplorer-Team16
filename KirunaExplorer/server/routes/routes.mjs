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




router.delete("/api/document/:document_id", async (req, res) => {
  const { document_id } = req.params; 
  try {
    const result = await documentDAO.deleteDocument(document_id);
    if (result.affectedRows === 0) {
      return res.status(404).send("Document not found.");
    }
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting the document.");
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

router.get("/api/document/geo/area", async (req, res) => {
  try {
    // Recupera tutti i documenti dal database    
    const area = await documentDAO.getAreas();
    // Risponde con i documenti in formato JSON
    res.status(200).json(area);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching document position.");
  }
});

router.post("/api/geo/area", async (req, res) => {
  try {
    // Recupera tutti i documenti dal database    
    await documentDAO.addArea(req.body);
    // Risponde con i documenti in formato JSON
    res.status(200).json();
  } catch (error) {
    // Gestione specifica dei codici di errore
    if (error.code === 403) {
      return res.status(403).json({ message: error.message || "Area name already exists." });
    } else if (error.code === 422) {
      return res.status(422).json({ message: error.message || "Invalid data provided." });
    }

    // Errore generico (500)
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
});

router.get("/api/geo/:areaId", async (req, res) => {
  try {
    // Recupera tutti i documenti dal database
    const coordinates = await documentDAO.getAreaCoordinates(req.params.areaId);
    // Risponde con i documenti in formato JSON
    res.status(200).json(coordinates);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching document position.");
  }
});

router.get("/api/document/title/:document_title/area", async (req, res) => {
  try {
    // Estrae il titolo del documento dai parametri della richiesta
    const { document_title } = req.params;

    // Controlla se il titolo del documento è fornito
    if (!document_title) {
      return res.status(400).json({ message: "Titolo del documento mancante." });
    }

    // Recupera l'area del documento dal database tramite il DAO
    const documentArea = await documentDAO.getAreaIdByDocumentId(document_title);

    // Controlla se l'area del documento esiste
    if (!documentArea) {
      return res.status(404).json({ message: "Area del documento non trovata." });
    }

    // Risponde con i dettagli dell'area del documento
    res.status(200).json(documentArea);
  } catch (error) {
    console.error("Errore durante il recupero dell'area del documento:", error);
    res.status(500).send("Si è verificato un errore durante il recupero dell'area del documento.");
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

router.post("/api/stakeholder", async (req, res) => {

  try {
    await documentDAO.util_insertStakeholder(req.body.stakeholder_name);

    res.status(201).send("Stakeholder successfully inserted");
  } catch (error) {
    console.error(error);
    if (error === "Duplicated stakeholder") {
      res.status(403).send("Duplicated stakeholder"); //CHANGED ERROR MESSAGE

    } else {

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
    if (error === "Duplicated link") {
      res.status(403).send("Duplicated Link"); //CHANGED ERROR MESSAGE

    } else {

      res.status(500).send(error.message); //CHANGED ERROR MESSAGE
    }
  }
});


// Rotta per ottenere connessioni basate sul titolo del documento
router.post('/api/document/connections/document', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "Il titolo del documento è richiesto." });
  }

  try {
    // Chiama il DAO per ottenere le connessioni
    const connections = await documentDAO.getConnectionsByDocumentTitle(title)
    res.status(200).json({ success: true, data: connections });
    console.log(connections, 'ROUTER')
  } catch (error) {
    console.error("Errore connessioni documento", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rotta per cancellare una connessione tra due documenti
router.delete('/api/document/connections/delete', async (req, res) => {
  const { doc1_id, doc2_id, connection_type } = req.body;

  if (!doc1_id || !doc2_id || !connection_type) {
    return res.status(400).json({ success: false, message: "Gli ID dei documenti e il tipo di connessione sono richiesti." });
  }

  try {
    // Chiama il DAO per cancellare la connessione
    const message = await documentDAO.deleteConnection(doc1_id, doc2_id, connection_type);
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error("Errore durante la cancellazione della connessione:", error.message);
    res.status(500).json({ success: false, message: error.message });
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
// Rotta per ottenere tutti i tipi di documenti
router.get("/api/types", async (req, res) => {
  try {
    const types = await documentDAO.getDocumentTypes();
    res.status(200).json(types);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching document types.");
  }
});

// Rotta per aggiungere un nuovo tipo di documento
router.post("/api/types", async (req, res) => {
  const { type_name } = req.body;
  console.log(type_name )

  if (!type_name || type_name.trim() === "") {
    console.log(type_name )
    return res.status(422).send("Missing type name.");
  }

  try {
    // Inserisci il nuovo tipo di documento
    const result = await documentDAO.addDocumentType(type_name.trim());
    
    if (result === "Document type already exists") {
      return res.status(403).json({ message:"Document type already exists"});
    }


    res.status(201).json({ message: "Document type successfully added." , data: result,});
  } catch (error) {
    console.error(error , "+++");
    // Send the error message along with the stack trace (optional, for debugging)
    res.status(500).json({
      message: error.message,
      error: error.message,  // You can include the error message or stack if needed
    });
  }
});
router.delete("/api/geo/area", async (req, res) => {
  const { areaName } = req.body;

  try {
    const result = await documentDAO.deleteArea(areaName);
    res.status(200).json({ message: "Area deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// Endpoint per ottenere i dettagli di un documento tramite il suo titolo
router.get("/api/document/:document_title", async (req, res) => {
  try {
    // Estrae il titolo del documento dai parametri della richiesta
    const { document_title } = req.params;

    // Controlla se il titolo del documento è fornito
    if (!document_title) {
      return res.status(400).json({ message: "Titolo del documento mancante." });
    }

    // Recupera i dettagli del documento dal database tramite il DAO
    const document = await documentDAO.getDocumentByTitle(document_title);

    // Controlla se il documento esiste
    if (!document) {
      return res.status(404).json({ message: "Documento non trovato." });
    }

    // Risponde con i dettagli del documento
    res.status(200).json(document);
  } catch (error) {
    console.error("Errore durante il recupero del documento:", error);
    res.status(500).send("Si è verificato un errore durante il recupero del documento.");
  }
});
// Endpoint per eliminare un link
router.delete('/api/links', async (req, res) => {
  const { parentId, childId, connectionType } = req.body;

  // Verifica che i parametri necessari siano forniti
  if (!parentId || !childId || !connectionType) {
    return res.status(400).json({
      success: false,
      message: 'Parametri mancanti: parentId, childId e connectionType sono richiesti.',
    });
  }

  try {
    // Chiamata al metodo DAO per eliminare il link
    const result = await documentDAO.deleteLink(parentId, childId, connectionType);

    if (result) {
      return res.status(200).json({
        success: true,
        message: 'Link eliminato con successo.',
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Nessun link trovato con i parametri forniti.',
      });
    }
  } catch (error) {
    console.error('Errore durante l\'eliminazione del link:', error);
    return res.status(500).json({
      success: false,
      message: 'Errore interno del server.',
    });
  }
});

router.put("/api/edit-document", async (req, res) => {
  try {
    console.log("Request received with body:", req.body);
    
    // Call the function to update the document
    const updateResult = await documentDAO.updateDocument(req.body);
    console.log("Update result:", updateResult);

    // If update is successful, send a success response
    return res.status(200).json({ message: "Document updated successfully." });
  } catch (error) {
    console.error("Error during update:", error);
    // Handle specific errors
    if (error.message === "A document with the same title already exists.") {
      return res.status(400).json({ error: "A document with the same title already exists." });
    } else if (error.message === "Error updating document fields." || error.message === "Document ID not found." || error.message === "Error removing previous stakeholders." || error.message === "Error inserting stakeholders") {
      return res.status(500).json({ error: "An error occurred while updating the document." });
    }

    // Generic error handling
    return res.status(500).json({ error: "Internal server error." });
  }
});



router.put("/api/edit-area", async (req, res) => {
  try {
    console.log("Request received with body:", req.body);

    // Verifica che il body contenga sia l'area_id che il nuovo area_name
    const { area_id, new_area_name } = req.body;
    if (!area_id || !new_area_name) {
      return res.status(400).send("area_id and new_area_name are required.");
    }

    // Esegui l'aggiornamento usando il DAO
    const updateResult = await documentDAO.updateAreaName(area_id, new_area_name);

    if (updateResult) {
      return res.status(200).json({ message: "Area name updated successfully." });
    }

  } catch (error) {
    console.error("Error during the update:", error);
    if (error.message === "The area name is already in use. Please choose a different name.") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).send("An error occurred during the area name update.");
  }
});



router.get("/api/get-area-name", async (req, res) => {
  try {
    const { document_id } = req.query;
    if (!document_id) {
      return res.status(400).send("document_id is required.");
    }
    const areaName = await documentDAO.getAreaNameByDocumentId(document_id);

    if (areaName) {
      return res.status(200).json({ area_name: areaName });
    }

  } catch (error) {
    console.error("Error retrieving area name:", error);
    if (error.message === "No area name associated with this document_id.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).send("An error occurred while retrieving the area name.");
  }
});







export default router;
