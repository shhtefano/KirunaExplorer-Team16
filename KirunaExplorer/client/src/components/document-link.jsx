import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import API from "../services/API.js";
import { Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete"; // Importa l'icona

export default function DocumentLink({ initialDocument , refreshLinks, setRefreshLinks}) {
  const [documents, setDocuments] = useState([]); // Documenti caricati
  const [connections, setConnections] = useState([]); // Collegamenti del documento
  const [selectedDocument, setSelectedDocument] = useState(null); // Documento selezionato
  const [linkType, setLinkType] = useState(""); // Tipo di collegamento
  const [searchQuery, setSearchQuery] = useState(""); // Query di ricerca
  const [visibleCount, setVisibleCount] = useState(5); // Numero iniziale di documenti visibili
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [errorSeverity, setErrorSeverity] = useState('');

  // Caricamento documenti e collegamenti
  useEffect(() => {
    const fetchDocumentsAndConnections = async () => {
      try {
        const documentsResponse = await API.getDocuments();
        setDocuments(documentsResponse);

        const connectionsResponse = await API.getConnectionsByDocumentTitle(initialDocument.document_title);
        setConnections(connectionsResponse.data || []);
      } catch (error) {
        console.error("Errore durante il caricamento:", error);
      }
    };

    fetchDocumentsAndConnections();
  }, [initialDocument.document_title]);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setLinkType(""); // Reset tipo di link al cambio documento
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleLinkDocuments = async () => {
    if (selectedDocument && linkType) {
      const result = await API.linkDocuments(
        initialDocument.document_title,
        selectedDocument.document_title,
        linkType
      );

      if (result.success) {
        // Aggiorna la lista delle connessioni
        setConnections((prev) => [
          ...prev,
          {
            parent_id: initialDocument.document_title,
            children_id: selectedDocument.document_title,
            connection_type: linkType,
          },
        ]);

        // Verifica se il documento è già presente nella lista
        setDocuments((prevDocuments) => {
          const isAlreadyLinked = prevDocuments.some(
            (doc) => doc.document_title === selectedDocument.document_title
          );

          if (isAlreadyLinked) {
            return prevDocuments; // Evita di aggiungere duplicati
          }

          return [...prevDocuments, selectedDocument];
        });

        // Reset stato
        setSnackbarMsg('Linked successfully');
        setOpenSnackbar(true);
        setErrorSeverity('success');
        setRefreshLinks((prev) => !prev);

       
        setSelectedDocument(null);
        setLinkType("");
      } else {
        setSnackbarMsg('Duplicated link');
        setOpenSnackbar(true);
        setErrorSeverity('error');
        console.log(result.message);
      }
    }
  };

  const handleDeleteConnection = async (doc1_id, doc2_id, connection_type) => {
    const result = await API.deleteConnection(doc1_id, doc2_id, connection_type);

    if (result.success) {
      // Rimuovi la connessione dalla lista
      setConnections((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !(conn.parent_id === doc1_id && conn.children_id === doc2_id && conn.connection_type === connection_type)
        )
      );

      // Reset stato
      setSnackbarMsg('Connection deleted successfully');
      setOpenSnackbar(true);
      setRefreshLinks((prev) => !prev);

      setErrorSeverity('success');
    } else {
      setSnackbarMsg('Failed to delete connection');
      setOpenSnackbar(true);
      setErrorSeverity('error');
    }
  };

  // Filtraggio documenti
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      doc.document_title !== initialDocument.document_title
  );

  // Documenti visibili (limitati da `visibleCount`)
  const visibleDocuments = filteredDocuments.slice(0, visibleCount);

  return (
    <div>
      <Card className="min-w-[280px] max-w-[700px]">
        <CardContent>
          <div className="mb-4 mt-2">
            Search and select a document to link it to "{initialDocument.document_title}".
          </div>

          {/* Lista collegamenti */}
          <div className="mb-6">
            <div className="font-semibold text-sm mb-2">Existing Links:</div>
            {connections.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {connections.map((conn, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{conn.children_id} ({conn.connection_type})</span>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteConnection(conn.parent_id, conn.children_id, conn.connection_type)}
                    >
                      <DeleteIcon /> {/* Aggiungi l'icona del cestino */}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted">No connections found.</div>
            )}
          </div>

          {/* Search bar */}
          <Input
            placeholder="Search by document title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {/* Lista documenti */}
          <div className="grid grid-cols-1 gap-2">
            {visibleDocuments.map((doc) => (
              <div key={doc.document_title}>
                <DocButton
                  document={doc}
                  isSelected={selectedDocument?.document_title === doc.document_title}
                  onClick={() => handleDocumentClick(doc)}
                />

                {/* Mostra opzioni di collegamento sotto il documento selezionato */}
                {selectedDocument?.document_title === doc.document_title && (
                  <div className="mt-2 space-y-2 p-4 border rounded-md bg-gray-50">
                    <div className="font-semibold text-sm">
                      Link "{initialDocument.document_title}" to "{selectedDocument.document_title}"
                    </div>
                    <Select
                      onValueChange={(value) => setLinkType(value)}
                      value={linkType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select link type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reference">Reference</SelectItem>
                        <SelectItem value="Collateral Consequence">Collateral Consequence</SelectItem>
                        <SelectItem value="Projection">Projection</SelectItem>
                        <SelectItem value="Material Effects">Material Effects</SelectItem>
                        <SelectItem value="Direct Consequence">Direct Consequence</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => handleLinkDocuments()} disabled={!linkType}>
                      Link Documents
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pulsante "Load More" stilizzato */}
          {filteredDocuments.length > visibleCount && (
            <div className="mt-4 text-center">
              <Button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                variant="ghost"
                className="w-full py-2 text-sm font-semibold text-blue-600 border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none"
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        style={{ marginTop: "60px" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={errorSeverity} sx={{ width: "70%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}

export function DocButton({ document, isSelected, onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`w-full text-left p-2 ${isSelected ? "bg-blue-100 border-blue-500" : ""}`}
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">{document.document_title}</span>
      </div>
    </Button>
  );
}