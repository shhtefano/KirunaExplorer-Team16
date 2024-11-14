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

export default function DocumentLink(/*{ initialDocument }*/) { // MOCK
  const [documents, setDocuments] = useState([]); // State for documents from the database
  const [selectedDocument, setSelectedDocument] = useState(null); // State for the document to link
  const [linkType, setLinkType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const initialDocument = { document_title: '2001 Material Access.pdf' }; // MOCK

  // useEffect to load documents at startup
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments(); // Function to fetch documents
        setDocuments(response); // Set documents in state
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setLinkType(""); // Reset link type when selecting a new document
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

  // Filter documents, excluding the already selected one
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
        
        {/* Search bar */}
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        {/* Filtered document list */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.document_title}>
              <DocCard
                document={doc}
                isSelected={selectedDocument?.document_title === doc.document_title}
                onClick={() => handleDocumentClick(doc)}
              />

              {/* Selection and link section below selected document */}
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
