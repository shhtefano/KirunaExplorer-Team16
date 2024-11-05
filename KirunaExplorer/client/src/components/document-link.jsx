import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { useState } from "react";
  import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
  import API from "../services/API.js";
  
  export default function DocumentLink() {
    const documentsMock = [
      {
        document_title: "Project Management Guidelines",
        stakeholder: "Urban Planner",
        scale: "Small Architectural Scale",
        issuance_date: "2023-05-15",
        connections: 12,
        language: "English",
        pages: 35,
        document_type: "Informative Document",
        document_description:
          "An informative document providing guidelines to support project management practices among municipal Urban Planners and other stakeholders involved in city development.",
      },
      {
        document_title: "Risk Assessment Report 2024",
        stakeholder: "Urban Developer",
        scale: "Large Architectural Scale",
        issuance_date: "2024-02-10",
        connections: 20,
        language: "French",
        pages: 28,
        document_type: "Prescriptive Document",
        document_description:
          "A prescriptive risk assessment detailing anticipated impacts and potential measures, with focus on Kiruna’s new urban development areas. It is integral for ensuring safety in projected construction sites.",
      },
      
    ];
  
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [linkType, setLinkType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
  
    const handleDocumentClick = (document) => {
      setSelectedDocument(document.document_title === selectedDocument ? null : document.document_title);
      setLinkType(""); // Reset the link type each time a new document is selected
    };
  
    const handleLinkDocument = () => {
      console.log("Linking document:", selectedDocument, props.document.document_title , "with link type:", linkType);
      // API call to link the document can go here
      API.linkDocuments(selectedDocument, props.document.document_title , linkType)
      setSelectedDocument(null); // Reset after linking
      setLinkType(""); // Clear the selection
    };
  
    const filteredDocuments = documentsMock.filter((doc) =>
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <Card className="min-w-[280px] max-w-[600px]">
        <CardHeader>
          <CardTitle>Link a Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4">
            Here you can link documents to the relevant project. Select documents from the list below.
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
                isSelected={selectedDocument === doc.document_title}
                onClick={() => handleDocumentClick(doc)}
                linkType={linkType}
                setLinkType={setLinkType}
                onLinkDocument={handleLinkDocument}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  export function DocCard({ document, isSelected, onClick, linkType, setLinkType, onLinkDocument }) {
    return (
      <Card onClick={onClick} className="relative w-full p-4 text-sm shadow-md border border-gray-200 cursor-pointer">
        <CardHeader>
          <CardTitle className="text-sm font-semibold mb-2">{document.document_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 ">
          <div>Issuance Date: {document.issuance_date}</div>
          <div>Description: {document.document_description}</div>
        </CardContent>
        {isSelected && (
          <div className="mt-4 space-y-2">
            <Select onValueChange={(value) => setLinkType(value)} value={linkType}>
              <SelectTrigger>
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reference">Update</SelectItem>
                <SelectItem value="Collateral Consequence">Collateral Consequence</SelectItem>
                <SelectItem value="Projection">Projection</SelectItem>
                <SelectItem value="Material Effects">Material Effects</SelectItem>
                <SelectItem value="Direct Consequence">Direct Consequence</SelectItem>

                

              </SelectContent>
            </Select>
            <Button onClick={(e) => {
                e.stopPropagation(); // Prevent closing on document click
                onLinkDocument(document.document_title);
              }}>
              Link
            </Button>
          </div>
        )}
      </Card>
    );
  }
  