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
import { toast } from "sonner";
import API from "../services/API.js";

export default function DocumentLinkOnCreation({ onSave , initialDocumentTitle,temporaryLinks, setTemporaryLinks }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [linkType, setLinkType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
 // const initialDocument = { document_title: '2001 Material Access.pdf' }; // MOCK

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
    setLinkType("");
  };

  const handleAddTemporaryLink = () => {
    if (selectedDocument && linkType) {
      const newLink = {
        from:initialDocumentTitle,
        to: selectedDocument.document_title,
        type: linkType,
      };
      setTemporaryLinks([...temporaryLinks, newLink]);
      toast.success(`Linked "${initialDocumentTitle}" with "${selectedDocument.document_title}" as ${linkType}.`);
      setSelectedDocument(null);
      setLinkType("");
    }
  };

  const handleRemoveTemporaryLink = (index) => {
    setTemporaryLinks(temporaryLinks.filter((_, i) => i !== index));
    toast.success("Link removed.");
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      doc.document_title !== initialDocumentTitle
  );

  const handleSave = () => {
    setTemporaryLinks(temporaryLinks);

    onSave();  // Salva i link temporanei senza chiamare l'API
   // setTemporaryLinks([]);
    toast.success("Temporary links saved locally.");
  };

  return (
    <Card className="min-w-[680px] max-w-[800px]" >
      <CardHeader style={{ border:"none"  }}>
        <CardTitle>Link Document to "{initialDocumentTitle}"</CardTitle>
      </CardHeader>
      <CardContent>

        {temporaryLinks.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Temporary Links:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {temporaryLinks.map((link, index) => (
                <div key={index} style={{ display: "flex", flexDirection: "column", justifyContent: "justify-between", alignItems: "flex-start", marginTop: "10px" }}>
                <li key={index} className="text-sm flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleRemoveTemporaryLink(index)}
                  >
                    X
                  </Button>
                  <span>
                    {link.from} -- {link.to} ({link.type})
                  </span>
                </li>

                </div>
              ))}
            </ul>
          </div>
        )}

        {temporaryLinks.length !== 0 && <Button onClick={handleSave} className="mt-4" disabled={temporaryLinks.length === 0}>
          Save Links 
        </Button>}

        {initialDocumentTitle ? (<div className="text-muted-foreground mt-2 mb-2">
          Search and select a document to link.
        </div>) : 

          (<div className="text-red-500 mt-2 mb-3">

            Write the document title before selecting a link.
          </div>) 
        
      
      }
        
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.document_title}>
              <DocButton
                document={doc}
                isSelected={selectedDocument?.document_title === doc.document_title}
                onClick={() => handleDocumentClick(doc)}
                initialDocumentTitle={initialDocumentTitle}
              />

              {selectedDocument?.document_title === doc.document_title && (
                <div className="mt-2 space-y-2 p-4 border rounded-md bg-gray-50">
                  <div className="font-semibold text-sm">
                    Link "{initialDocumentTitle}" to "{selectedDocument.document_title}"
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
                  <Button onClick={handleAddTemporaryLink} disabled={!linkType}>
                    Add Link
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

// Componente del pulsante per i documenti
export function DocButton({ document, isSelected, onClick , initialDocumentTitle}) {
  return (
    <Button
    disabled={!initialDocumentTitle}
      onClick={onClick}
      className={`bg-white text-black border border-gray-200 shadow-sm w-full hover:bg-gray-100 ${
        isSelected ? "bg-blue-500 text-white border-blue-700" : ""
      }`}
    >
      {document.document_title}
    </Button>
  );
}
