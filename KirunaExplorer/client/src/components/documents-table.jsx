import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import API from "../services/API.js";
import DocumentLink from "./document-link.jsx";

export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null); // Documento selezionato per il dialog
  const [showLinkInterface, setShowLinkInterface] = useState(false); // Stato per mostrare l'interfaccia di linking
  const [visibleCount, setVisibleCount] = useState(10); // Numero di documenti visibili inizialmente

  // Caricamento dei documenti
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments();
        const sortedDocuments = response.sort((a, b) =>
          a.document_title.localeCompare(b.document_title)
        );
        setDocuments(sortedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  // Filtraggio dei documenti in base alla query di ricerca
  const filteredDocuments = documents.filter((doc) =>
    doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Documenti visibili in base al conteggio
  const visibleDocuments = filteredDocuments.slice(0, visibleCount);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-md">
      <div className="mb-6">
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <Table className="border rounded">
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Issuance Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleDocuments.length > 0 ? (
            visibleDocuments.map((doc) => (
              <TableRow key={doc.document_title} className="hover:bg-gray-50">
                <TableCell className="py-2 px-4">{doc.document_title}</TableCell>
                <TableCell className="py-2 px-4">{doc.issuance_date}</TableCell>
                <TableCell className="py-2 px-4">{doc.document_type}</TableCell>
                <TableCell className="py-2 px-4">{doc.language}</TableCell>
                <TableCell className="py-2 px-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowLinkInterface(false); // Mostra solo la scheda inizialmente
                        }}
                      >
                        View
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      className="max-w-lg p-6 bg-white rounded-lg shadow-lg"
                      style={{ maxHeight: "80vh", overflowY: "auto" }} // Dialog scorrevole
                    >
                      {/* Scheda documento sempre visibile */}
                      <div>
                        <DialogTitle className="text-xl font-bold text-gray-800">
                          {selectedDocument?.document_title}
                        </DialogTitle>
                        <div className="mt-3 space-y-3 text-gray-700">
                          <p>
                            <strong>Issuance Date:</strong> {selectedDocument?.issuance_date}
                          </p>
                          <p>
                            <strong>Type:</strong> {selectedDocument?.document_type}
                          </p>
                          <p>
                            <strong>Language:</strong> {selectedDocument?.language}
                          </p>
                          <p>
                            <strong>Pages:</strong> {selectedDocument?.pages}
                          </p>
                        </div>
                      </div>
                      {/* Espansione dell'interfaccia di linking */}
                      {showLinkInterface ? (
                        <div className="mt-6 border-t pt-4">
                          <DocumentLink initialDocument={selectedDocument} />
                        </div>
                      ) : (
                        <button
                        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => setShowLinkInterface(true)}
                        >
                          Link Documents
                        </button>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pulsante "Load More" se ci sono altri documenti */}
      {filteredDocuments.length > visibleCount && (
        <div className="mt-4 text-center">
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
