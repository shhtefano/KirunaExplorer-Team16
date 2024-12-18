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
        <div style={{display: "flex", alignContent: "center", justifyContent: "center", alignItems: "center", }}>
        <Modal
          // className="custom-modal text-center"
          // dialogClassName="custom-modal-width"
          show={showModalLink}
          onHide={() => setShowModalLink(false)}
          style={{
            textAlign: "center",
            margin: "auto",
            maxWidth: "90%", // Imposta una larghezza massima per evitare sovrapposizioni
          }}          scrollable 
          overflow="auto !important"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedDocument?.document_title || "Document Links"} Connections
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="custom-modal-body">
            {links.length > 0 ? (
             // Modifica la parte in cui vengono visualizzati i link
                <ul style={{ padding: 0, listStyle: "none" }}>
                  {links.map((link, index) => (
                    <li key={index} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center" }}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flex: 1 }}>
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
                              whiteSpace: "nowrap",
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
                              whiteSpace: "nowrap",
                            }}
                          >
                            {link.children_id}
                          </button>
                          <Typography variant="body2" color="textSecondary" style={{ textTransform: "lowercase" }}>
                            Type: <strong>{link.connection_type}</strong>
                          </Typography>
                        </Stack>
                      </a>

                      {/* Bottone per rimuovere il link */}
                      
                    </li>
                  ))}
                </ul>
            ) : (
              <p>No connections available for this document.</p>
            )}

            {doc && showDocInfo && 
            <DocumentInfoModal doc={doc} showDocInfo={showDocInfo} setShowDocInfo={setShowDocInfo} selectedDocument={selectedDocument}/>}
          </Modal.Body>
          <Modal.Footer>
          <Button variant="dark" 
            onClick={() => setShowModalLink(false)}>
            Close
            </Button>
          </Modal.Footer>
        </Modal>

        </div>
      )}
    </>
  );
}

export function DocumentInfoModal({doc, showDocInfo, setShowDocInfo, selectedDocument}) {
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


  return (
    <Modal

    style={{
      paddingTop: "20px", // Riduci il padding superiore per un aspetto migliore
      margin: "auto",
      maxWidth: "80%", // Imposta una larghezza massima
    }}    scrollable
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

      <Modal.Footer>
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
