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

export default function DocumentLink(/*{ initialDocument }*/) { //MOCK
  const [documents, setDocuments] = useState([]); // Stato per documenti dal database
  const [selectedDocument, setSelectedDocument] = useState(null); // Stato per il secondo documento da selezionare
  const [linkType, setLinkType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
const initialDocument={document_title: '2001 Material Access.pdf'}; //MOCK
  // useEffect per caricare i documenti all'inizio
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments(); // Funzione per ottenere i documenti
        setDocuments(response); // Imposta i documenti nello stato
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
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
        // Clear selections
        setSelectedDocument(null);
        setLinkType("");
      } else {
        // Display error message
        toast.error(result.message);
      }
    }
  };

  // Filtra i documenti escluso quello già selezionato
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      doc.document_title !== initialDocument.document_title
  );

  return (
    <Card className="min-w-[280px] max-w-[600px]">
      <CardHeader>
        <CardTitle>Link Document to "{initialDocument.document_title}"</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground mb-4">
          Search and select a document to link it to "{initialDocument.document_title}".
        </div>
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <DocCard
              key={doc.document_title}
              document={doc}
              isSelected={selectedDocument?.document_title === doc.document_title}
              onClick={() => handleDocumentClick(doc)}
            />
          ))}
        </div>
        {selectedDocument && (
          <div className="mt-4 space-y-2">
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
      </CardContent>
    </Card>
  );
}

export function DocCard({ document, isSelected, onClick }) {
  return (
    <Card
      onClick={onClick}
      className={`relative w-full p-4 text-sm shadow-md border border-gray-200 cursor-pointer ${
        isSelected ? "bg-blue-100" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-sm font-semibold mb-2">
          {document.document_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>Issuance Date: {document.issuance_date}</div>
        <div>Description: {document.document_description}</div>
      </CardContent>
      {isSelected && (
        <div className="absolute top-2 right-2 text-green-500 font-semibold">
          Selected
        </div>
      )}
    </Card>
  );
}
