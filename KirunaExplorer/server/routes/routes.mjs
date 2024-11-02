import express from "express";
import { insertDocument } from "../dao/document-dao.mjs";
const router = express.Router();

/*** DOCUMENT ROUTES ***/

router.post("/api/document", async (req,res) => {
  const {document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description, area_name, coordinates} = req.body;
  try {
      // Step 1: Aggiungere il documento
      await insertDocument(document_title, stakeholder, scale, issuance_date, connections, language, pages, document_type, document_description, area_name, coordinates);
      
      res.status(201).send("Document successfully inserted");
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while adding node and area.");
  }})

export default router;
