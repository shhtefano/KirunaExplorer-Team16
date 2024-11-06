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
        document_type: "Informative Document",
        document_description: "Guidelines for project management practices.",
      },
      {
        document_title: "Risk Assessment Report 2024",
        stakeholder: "Urban Developer",
        scale: "Large Architectural Scale",
        issuance_date: "2024-02-10",
        document_type: "Prescriptive Document",
        document_description: "Risk assessment for new urban development areas.",
      },
    ];
  
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [linkType, setLinkType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
  
    const handleDocumentClick = (document) => {
      if (selectedDocuments.some((doc) => doc.document_title === document.document_title)) {
        setSelectedDocuments(selectedDocuments.filter((doc) => doc.document_title !== document.document_title));
      } else if (selectedDocuments.length < 2) {
        setSelectedDocuments([...selectedDocuments, document]);
      }
    };
  
    const handleLinkDocuments = () => {
      if (selectedDocuments.length === 2 && linkType) {
        API.linkDocuments(selectedDocuments[0].document_title, selectedDocuments[1].document_title, linkType);
        console.log(`Linking ${selectedDocuments[0].document_title} with ${selectedDocuments[1].document_title} as ${linkType}`);
        setSelectedDocuments([]);
        setLinkType("");
      }
    };
  
    const filteredDocuments = documentsMock.filter((doc) =>
      doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return (
      <Card className="min-w-[280px] max-w-[600px]">
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
                isSelected={selectedDocuments.some((d) => d.document_title === doc.document_title)}
                onClick={() => handleDocumentClick(doc)}
                disabled={selectedDocuments.length === 2 && !selectedDocuments.some((d) => d.document_title === doc.document_title)}
              />
            ))}
          </div>
          {selectedDocuments.length === 2 && (
            <div className="mt-4 space-y-2">
              <Select onValueChange={(value) => setLinkType(value)} value={linkType}>
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
  
  export function DocCard({ document, isSelected, onClick, disabled }) {
    return (
      <Card
        onClick={!disabled ? onClick : undefined}
        className={`relative w-full p-4 text-sm shadow-md border border-gray-200 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <CardHeader>
          <CardTitle className="text-sm font-semibold mb-2">{document.document_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>Issuance Date: {document.issuance_date}</div>
          <div>Description: {document.document_description}</div>
        </CardContent>
        {isSelected && <div className="absolute top-2 right-2 text-green-500 font-semibold">Selected</div>}
      </Card>
    );
  }
  