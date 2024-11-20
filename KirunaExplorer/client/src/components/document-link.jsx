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
import { toast } from "sonner";

export default function DocumentLink({ initialDocument }) {
  const [documents, setDocuments] = useState([]); // Documenti caricati
  const [selectedDocument, setSelectedDocument] = useState(null); // Documento selezionato
  const [linkType, setLinkType] = useState(""); // Tipo di collegamento
  const [searchQuery, setSearchQuery] = useState(""); // Query di ricerca
  const [visibleCount, setVisibleCount] = useState(5); // Numero iniziale di documenti visibili

  // Caricamento dei documenti
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments();
        setDocuments(response);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setLinkType(""); // Reset tipo di link al cambio documento
  };

  const handleLinkDocuments = async () => {
    if (selectedDocument && linkType) {
      const result = await API.linkDocuments(
        initialDocument.document_title,
        selectedDocument.document_title,
        linkType
      );

      if (result.success) {
        toast.success(
          `Successfully linked "${initialDocument.document_title}" with "${selectedDocument.document_title}" as ${linkType}.`
        );
        
        // Aggiungi il documento appena connesso alla lista dei documenti
        setDocuments((prevDocuments) => [
          ...prevDocuments,
          selectedDocument, // Aggiungiamo il documento selezionato alla lista
        ]);
        
        // Reset stato
        setSelectedDocument(null);
        setLinkType("");
      } else {
        toast.error(result.message);
      }
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
    <Card className="min-w-[280px] max-w-[600px]">
      <CardContent>
        <div className="text-muted-foreground mb-4">
          Search and select a document to link it to "{initialDocument.document_title}".
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
                  <Button onClick={handleLinkDocuments} disabled={!linkType}>
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
              variant="ghost" // Varianta 'ghost' per un aspetto diverso
              className="w-full py-2 text-sm font-semibold text-blue-600 border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none"
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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
