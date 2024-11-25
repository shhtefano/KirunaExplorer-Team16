import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import API from "../services/API.js";
import DocumentLink from "./document-link.jsx";
import DocumentMap from "./DocumentMap";

export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const documentTypes = [
    { type: "All" },
    { type: "Design" },
    { type: "Informative" },
    { type: "Technical" },
    { type: "Prescriptive" },
    { type: "Material Effects" },
    { type: "Agreement" },
    { type: "Conflict" },
    { type: "Consultation" },
  ];

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showLinkInterface, setShowLinkInterface] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments();
        const sortedDocuments = response.sort((a, b) => a.document_title.localeCompare(b.document_title));
        setDocuments(sortedDocuments);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.document_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType && selectedType !== "All" ? doc.document_type === selectedType : true;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewOnMapClick = (doc) => {
    setSelectedDocument(doc);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-12 bg-white rounded shadow-md overflow-auto">
      <div className="mb-6 text-gray-700">
        <p className="font-semibold mb-2">Search Document Title:</p>
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-6 text-gray-700">
        <p className="font-semibold mb-2">Select Document Type:</p>
        <Select onValueChange={setSelectedType} value={selectedType}>
          <SelectTrigger className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((docType) => (
              <SelectItem key={docType.type} value={docType.type}>
                {docType.type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table className="border rounded table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Title</TableHead>
            <TableHead className="w-1/5">Issuance Date</TableHead>
            <TableHead className="w-1/5">Type</TableHead>
            <TableHead className="w-1/5">Language</TableHead>
            <TableHead className="w-1/5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDocuments.length > 0 ? (
            paginatedDocuments.map((doc) => (
              <TableRow key={doc.document_title} className="hover:bg-gray-50">
                <TableCell className="py-2 px-4">{doc.document_title}</TableCell>
                <TableCell className="py-2 px-4">{doc.issuance_date}</TableCell>
                <TableCell className="py-2 px-4">{doc.document_type}</TableCell>
                <TableCell className="py-2 px-4">{doc.language}</TableCell>
                <TableCell className="py-2 px-4">
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          View
                        </button>
                      </DialogTrigger>
                      <DialogTrigger asChild>
                        <button
                          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => handleViewOnMapClick(doc)}
                        >
                          View on map
                        </button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
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

      <div className="mt-8 flex justify-center items-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? "font-bold text-blue-500" : ""}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {selectedDocument && (
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>{selectedDocument.document_title}</DialogTitle>
            <DialogDescription>
              <DocumentMap coordinates={selectedDocument.coordinates} documentType={selectedDocument.document_type} />
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
