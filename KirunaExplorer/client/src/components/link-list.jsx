import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Stack, Typography } from "@mui/material";
import API from "@/services/API";

const DocumentLinksModal = ({ selectedDocument, showModalLink, setShowModalLink }) => {
  const [links, setLinks] = useState([]);

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

  return (
    <>
      {selectedDocument && showModalLink && (
        <Modal
          style={{
            marginTop: "8%",
            maxWidth: "800px", // Aumenta la larghezza massima
            width: "90%", // Percentuale per dimensione fluida
          }}
          dialogClassName="custom-modal-width"
          show={showModalLink}
          onHide={() => setShowModalLink(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedDocument?.document_title || "Document Links"} Connections
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{
              minWidth: "700px", // Garantisce larghezza minima per evitare a capo
            }}
          >
            {links.length > 0 ? (
              <ul style={{ padding: 0, listStyle: "none" }}>
                {links.map((link, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <button
                          style={{
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            color: "#333",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                         {link.parent_id}
                        </button>
                        <Typography variant="body2" style={{ color: "#555" }}>
                          →
                        </Typography>
                        <button
                          style={{
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            color: "#333",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                        >
                          {link.children_id}
                        </button>
                        <Typography variant="body2" color="textSecondary">
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
          </Modal.Body>
          <Modal.Footer>
            <button
              style={{
                background: "none",
                border: "1px solid #ccc",
                padding: "4px 12px",
                borderRadius: "4px",
                color: "#555",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onClick={() => setShowModalLink(false)}
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default DocumentLinksModal;
