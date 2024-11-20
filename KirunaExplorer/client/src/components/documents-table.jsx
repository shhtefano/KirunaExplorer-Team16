import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription} from "@/components/ui/dialog";
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
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
                        >
                          View
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg p-6 bg-white rounded-lg shadow-lg">
                        <DialogTitle className="text-xl font-bold text-gray-800">{doc.document_title}</DialogTitle>
                        <DialogDescription className="mt-3 space-y-3 text-gray-700">
                          <p>
                            <strong>Stakeholders:</strong> {doc.stakeholder}
                          </p>
                          <p>
                            <strong>Scale:</strong> {doc.scale}
                          </p>
                          <p>
                            <strong>Issuance Date:</strong> {doc.issuance_date}
                          </p>
                          <p>
                            <strong>Language:</strong> {doc.language}
                          </p>
                          <p>
                            <strong>Pages:</strong> {doc.pages}
                          </p>
                          <div className="my-4">
                            <p>
                              <strong>Description:</strong> {doc.document_description}
                            </p>
                          </div>
                          <button
                            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                            onClick={() => {
                              // Placeholder for linking to another document
                              alert("Linking to another document");
                            }}
                          >
                            Connections
                          </button>
                        </DialogDescription>
                      </DialogContent>
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
    </div>
  );
}
