import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { Stack, Typography } from "@mui/material";
import API from "@/services/API";
import "@/App.css";  // Assicurati di importare il file CSS

export default function DocumentLinksModal({ selectedDocument, showModalLink, setShowModalLink }) {
  const [links, setLinks] = useState([]);
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [doc, setDoc] = useState([]); // doc linked to selectedDocument
  const [linkType, setLinkType] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      if (selectedDocument) {
        try {
          const data = await API.getConnectionsByDocumentTitle(selectedDocument.document_title);
          setLinks(data.data || []);
        } catch (error) {
          console.error("Error fetching links:", error);
          setLinks([]);
        }
      }
    };

    fetchLinks();
  }, [selectedDocument]);

  const handleClickDoc = (docId, connectionType) => {
    console.log("DOCUMENTO SELEZIONATO", docId); // Verifica che l'ID sia corretto
    setDoc(docId); // Imposta prima il documento
    setShowDocInfo(true); // Mostra il modal secondario
    setLinkType(connectionType);
    console.log("doc:", doc, "selectedDocument", selectedDocument);
  };

  return (
    <>
      {selectedDocument && showModalLink && (
        <Modal
          className="custom-modal"
          dialogClassName="custom-modal-width"
          show={showModalLink}
          onHide={() => setShowModalLink(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedDocument?.document_title || "Document Links"} Connections
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="custom-modal-body">
            {links.length > 0 ? (
              <ul style={{ padding: 0, listStyle: "none" }}>
                {links.map((link, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <button
                          onClick={() => handleClickDoc(link.parent_id, link.connection_type)}
                          style={{
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            color: "#333",
                            fontSize: "14px",
                            cursor: "pointer",
                            textTransform: "lowercase", // Aggiungi questa linea
                          }}
                        >
                          {link.parent_id}
                        </button>
                        <Typography variant="body2" style={{ color: "#555", textTransform: "lowercase" }}>
                          →
                        </Typography>
                        <button
                          onClick={() => handleClickDoc(link.children_id, link.connection_type)}
                          style={{
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            color: "#333",
                            fontSize: "14px",
                            cursor: "pointer",
                            textTransform: "lowercase", // Aggiungi questa linea
                          }}
                        >
                          {link.children_id}
                        </button>
                        <Typography variant="body2" color="textSecondary" style={{ textTransform: "lowercase" }}>
                          Type: <strong>{link.connection_type}</strong>
                        </Typography>
                      </Stack>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No links available for this document.</p>
            )}

            {doc && showDocInfo && 
            <DocumentInfoModal doc={doc} showDocInfo={showDocInfo} setShowDocInfo={setShowDocInfo} linkType={linkType} selectedDocument={selectedDocument}/>}
          </Modal.Body>
          <Modal.Footer>
          <Button variant="dark" 
            onClick={() => setShowModalLink(false)}>
            Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export function DocumentInfoModal({ doc, showDocInfo, setShowDocInfo, linkType , selectedDocument}) {
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      if (doc) {
        setLoading(true);
        setError(null);
        try {
          const response = await API.getDocumentById(doc);
          setDocumentDetails(response.data || null);
        } catch (err) {
          console.error("Error fetching document details:", err);
          setError("Unable to fetch document details.");
          setDocumentDetails(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDocumentDetails();
  }, [doc]);
  // Funzione per rimuovere il link associato al documento
  // Funzione per rimuovere il link associato al documento
const removeLink = async () => {
  try {
    // Chiamata API per rimuovere il link
    const response = await API.deleteLink(doc, selectedDocument.document_title, linkType); // Passa i parametri corretti
    if (response.success) {
      console.log(`Document link removed: ${doc}`);
      setShowDocInfo(false); // Chiudi il modal dopo la rimozione
      alert("Link removed successfully!");
    } else {
      console.error("Error removing document link:", response.message);
      setError(response.message || "Unable to remove document link.");
    }
  } catch (err) {
    console.error("Error removing document link:", err);
    setError("Unable to remove document link.");
  }
};

  return (
    <Modal

    style={{ paddingTop: "330px", marginLeft: "10px"}}  // Aggiungi padding superiore

   show={showDocInfo}
      onHide={() => setShowDocInfo(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>Document Info</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {documentDetails ? (
          <ul style={{ padding: 0, listStyleType: "none" }}>
            <li><strong>Name:</strong> {documentDetails.document_title}</li>
            <li><strong>Document Type:</strong> {documentDetails.document_type}</li>
            <li><strong>Stakeholder:</strong> {documentDetails.stakeholder}</li>
            <li><strong>Date:</strong> {documentDetails.issuance_date}</li>
            <li><strong>Description:</strong> {documentDetails.description}</li>
            <li><strong>Scale:</strong> {documentDetails.scale}</li>
            <li><strong>Language:</strong> {documentDetails.language}</li>
            <li><strong>Pages:</strong> {documentDetails.pages}</li>
          </ul>
        ) : (
          !loading && <p>No details available for this document.</p>
        )}
      </Modal.Body>
      <li><strong>Link Type: </strong> {linkType}</li>

      <Modal.Footer>
        {/* Bottone per rimuovere il link del documento */}
        <Button
          variant="danger"  // Puoi usare "danger" per il colore rosso
          onClick={removeLink}
        >
          Remove Link
        </Button>
        <Button
          variant="dark"
          onClick={() => setShowDocInfo(false)}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
