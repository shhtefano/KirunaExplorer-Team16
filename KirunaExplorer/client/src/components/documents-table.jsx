import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Drawer } from "@/components/ui/drawer";
import API from "../services/API.js";

export default function DocumentsTable() {

  const [documents, setDocuments] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); 
  const [selectedDocument, setSelectedDocument] = useState(null); // mode of selected document to display



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


  // Handle View button click
  const handleViewClick = (document) => {
    setSelectedDocument(document);
    setIsDrawerOpen(true); // Open the drawer when a document is selected
  };

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
                <TableCell>
                  <div className="flex space-x-2">
                    <button
                        className="px-2 py-1 text-blue-500 border border-blue-500 rounded hover:bg-blue-500 hover:text-white"
                        onClick={() => handleViewClick(doc)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        View
                    </button>
                    <button className="px-2 py-1 text-orange-500 border border-orange-500 rounded hover:bg-orange-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                    </button>
                    <button className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                  </div>
                </TableCell>
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



      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={selectedDocument?.document_title}>
        {selectedDocument && (
          <div className="p-4">
            <p><strong>Stakeholders:</strong> {selectedDocument.stakeholder}</p>
            <p><strong>Scale:</strong> {selectedDocument.scale}</p>
            <p><strong>Issuance Date:</strong> {selectedDocument.issuance_date}</p>
            <p><strong>Connections:</strong> {selectedDocument.document_type}</p>
            <p><strong>Language:</strong> {selectedDocument.language}</p>
            <p><strong>Pages:</strong> {selectedDocument.pages}</p>
            <div className="my-auto">
              <p><strong >Description:</strong> {selectedDocument.document_dewscription}</p>
            </div>
          </div>
        )}
      </Drawer>

    

    </div>
  );
}
