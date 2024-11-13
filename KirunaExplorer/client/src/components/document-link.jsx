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

export default function DocumentLink() {
  const [documents, setDocuments] = useState([]); // Stato per documenti dal database
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [linkType, setLinkType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // useEffect per caricare i documenti all'inizio
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments(); // Funzione per ottenere i documenti
        console.log(response);
        setDocuments(response); // Imposta i documenti nello stato
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDocumentClick = (document) => {
    if (
      selectedDocuments.some(
        (doc) => doc.document_title === document.document_title
      )
    ) {
      setSelectedDocuments(
        selectedDocuments.filter(
          (doc) => doc.document_title !== document.document_title
        )
      );
    } else if (selectedDocuments.length < 2) {
      setSelectedDocuments([...selectedDocuments, document]);
    }
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length === 2 && linkType) {
      const result = await API.linkDocuments(
        selectedDocuments[0].document_title,
        selectedDocuments[1].document_title,
        linkType
      );

      if (result.success) {
        toast.success(
          `Successfully linked "${selectedDocuments[0].document_title}" and "${selectedDocuments[1].document_title}" as ${linkType}.`
        );
        // Clear selections
        setSelectedDocuments([]);
        setLinkType("");
      } else {
        // Display error message
        toast.error(result.message);
      }
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="min-w-[300px] max-w-[800px]" style={{textAlign: "center"}}>
      <CardHeader>
        <CardTitle>Link Two Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground mb-4">
          Select exactly two documents to link them together.
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
              isSelected={selectedDocuments.some(
                (d) => d.document_title === doc.document_title
              )}
              onClick={() => handleDocumentClick(doc)}
              disabled={
                selectedDocuments.length === 2 &&
                !selectedDocuments.some(
                  (d) => d.document_title === doc.document_title
                )
              }
            />
          ))}
        </div>
        {selectedDocuments.length === 2 && (
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
                <SelectItem value="Collateral Consequence">
                  Collateral Consequence
                </SelectItem>
                <SelectItem value="Projection">Projection</SelectItem>
                <SelectItem value="Material Effects">
                  Material Effects
                </SelectItem>
                <SelectItem value="Direct Consequence">
                  Direct Consequence
                </SelectItem>
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

export function DocCard({ document, isSelected, onClick, disabled }) {
  return (
    <Card
      onClick={!disabled ? onClick : undefined}
      className={`relative w-full p-4 text-sm shadow-md border border-gray-200 cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
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
