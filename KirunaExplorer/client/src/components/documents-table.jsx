import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import API from "../services/API.js";

export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");


  // Load documents and sort them by title
  useEffect(() => {
    const fetchDocuments = async () => {
      try {

        const response = await API.getDocuments(); 

        // Sort documents alphabetically by title 
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



  // Filtered list based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.document_title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="max-w-[800px] mx-auto p-4">
      <div className="mb-4">
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Issuance Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Language</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <TableRow key={doc.document_title}>
                <TableCell>{doc.document_title}</TableCell>
                <TableCell>{doc.issuance_date}</TableCell>
                <TableCell>{doc.document_type}</TableCell>
                <TableCell>{doc.language}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
