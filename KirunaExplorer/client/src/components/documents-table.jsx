import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import API from "../services/API.js";
import DocumentLink from "./document-link.jsx";
import DocumentMap from "./DocumentMap.jsx"; // Importa il componente mappa
import { MapIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "react-bootstrap";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";




export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("year");

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


  const languages = ["All", "English", "Swedish"];


  const [selectedMapDocument, setSelectedMapDocument] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showLinkInterface, setShowLinkInterface] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await API.getDocuments();
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



  const [stakeholderNames, setStakeholderNames] = useState(["All", "LKAB", "Citizens"]); // Array of stakeholders
  // From DB:
  // const [stakeholderNames, setStakeholderNames] = useState([]); // Array of stakeholders 
  // useEffect(() => {
  //   const fetchStakeholders = async () => {
  //     try {
  //       const response = await API.getStakeholders();
  //       const stakeholderNames = response.map((stakeholder) => stakeholder.stakeholder_name);
  //       setStakeholders(["All", ...stakeholderNames]);
  //     } catch (error) {
  //       console.error("Error fetching stakeholders:", error);
  //     }
  //   };
  //   fetchStakeholders();
  // }, []);

  



  const filteredDocuments = documents.filter((doc) => {

    const matchesSearch = doc.document_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType && selectedType !== "All" ? doc.document_type === selectedType : true;

    const matchesStakeholder =
      selectedStakeholder && selectedStakeholder !== "All" ? (doc.stakeholders || []).includes(selectedStakeholder) : true;
    
    const matchesLanguage =
      selectedLanguage && selectedLanguage !== "All" ? doc.language === selectedLanguage : true;


    // const matchesDate = (() => {
    //   // Skip filtering if no year, month, or day is provided
    //   if (!year && !month && !day) return true;
    //   const docDate = new Date(doc.issuance_date);

    //   if (dateFilterMode === "year" && year) {
    //     return docDate.getFullYear() === parseInt(year);
    //   } else if (dateFilterMode === "month" && year && month) {
    //     return (
    //       docDate.getFullYear() === parseInt(year) &&
    //       docDate.getMonth() === parseInt(month) - 1
    //     ); 
    //   } else if (dateFilterMode === "exact" && year && month && day) {
    //     return (
    //       docDate.getFullYear() === parseInt(year) &&
    //       docDate.getMonth() === parseInt(month) - 1 &&
    //       docDate.getDate() === parseInt(day)
    //     );
    //   }
    // })();



    // Filter by year only
    const matchesDate = (() => {
      if (!year) return true; // No year filter applied
      const docDate = new Date(doc.issuance_date);
      console.log(doc.issuance_date);
      return docDate.getFullYear() === parseInt(year);
    })();


    return matchesSearch && matchesType && matchesLanguage && matchesDate && matchesStakeholder;


  });








  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );





  useEffect(() => {
    if (!selectedDocument) {
      setShowLinkInterface(false);
    }
  }, [selectedDocument]);



  return (
    <div className="max-w-6xl mx-auto p-6 pb-12 bg-white rounded shadow-md overflow-auto">
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


      <div className="mb-6 text-gray-700">
        <p className="font-semibold mb-2">Select Language:</p>
        <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
          <SelectTrigger className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="mb-6 text-gray-700">
        <p className="font-semibold mb-2">Select Stakeholder:</p>
        <Select onValueChange={setSelectedStakeholder} value={selectedStakeholder}>
          <SelectTrigger className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {stakeholderNames.map((stakeholder) => (
              <SelectItem key={stakeholder} value={stakeholder}>
                {stakeholder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className="mb-6 text-gray-700">
        <p className="font-semibold mb-2">Select by Issuance Date:</p>
        <div className="flex items-center gap-4">
          <Select onValueChange={setDateFilterMode} value={dateFilterMode}>
            <SelectTrigger className="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="month">Month & Year</SelectItem>
              <SelectItem value="exact">Exact Date</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              />
              {dateFilterMode !== "year" && (
                <Input
                  placeholder="Month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              )}
              {dateFilterMode === "exact" && (
                <Input
                  placeholder="Day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              )}
            </div>
          </Popover>
        </div>
      </div>



      <Table className="border rounded table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Title</TableHead>
            <TableHead className="w-1/5">Issuance Date</TableHead>
            <TableHead className="w-1/5">Type</TableHead>
            <TableHead className="w-1/5">Language</TableHead>
            <TableHead className="w-1/4">Actions</TableHead>
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
                  <div className="flex">
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            style={{ backgroundColor: "black", color: "white" }}
                            className="px-3 py-1 text-sm text-white rounded"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowLinkInterface(false);
                            }}
                          >
                            Open
                          </button>


                        </DialogTrigger>
                        <DialogContent
                          className=" p-6 bg-white rounded-lg shadow-lg"
                          style={{ maxHeight: "140vh", overflowY: "auto" }}
                        >
                          <DialogTitle className="text-xl font-bold text-gray-800">
                            {selectedDocument?.document_title || "No Document Selected"}
                          </DialogTitle>
                          <DialogDescription className="text-gray-700">

                            {showLinkInterface ? (
                              <div className="mt-6 border-t pt-4">
                                <DocumentLink initialDocument={selectedDocument} />
                              </div>
                            ) : (
                              <div style={{ fontSize: "16px", margin: '10px' }}>

                                <p className="m-2"><strong>Stakeholders:</strong> {selectedDocument?.stakeholders?.length > 0
                                  ? selectedDocument.stakeholders.join(", ")
                                  : "No Stakeholders"}</p>
                                <p className="m-2"><strong>Scale:</strong> {selectedDocument?.scale}</p>
                                <p className="m-2"><strong>Issuance Date:</strong> {selectedDocument?.issuance_date}</p>
                                <p className="m-2"><strong>Type:</strong> {selectedDocument?.document_type}</p>
                                <p className="m-2"><strong>Language:</strong> {selectedDocument?.language}</p>
                                <p className="m-2"><strong>Pages:</strong> {selectedDocument?.pages}</p>
                                <div className="m-2 my-4">
                                  <p><strong>Description:</strong> {selectedDocument?.document_description}</p>
                                </div>
                                <Button
                                  variant="outline"
                                  style={{ backgroundColor: "black", color: "white" }}
                                  className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                                  onClick={() => setShowLinkInterface(true)}
                                >
                                  Link Documents
                                </Button>
                              </div>
                            )}
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            style={{ backgroundColor: "white", color: "black" }}
                            className="px-4"
                            onClick={() => {setSelectedMapDocument(doc)}}
                          >
                            <MapIcon color="black" alt="Open Map" label="Open Map"></MapIcon>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                          <DialogTitle className="text-xl font-bold text-gray-800">
                            {doc.document_title} - Map View
                          </DialogTitle>
                          <DialogDescription className="mt-4">
                            <DocumentMap
                              document_id={doc.document_id
                              }
                            />
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>
             
                    <div>
                      <button className="pl-4" // onClick={() => handleEditDocument(doc)}
                      >
                        <Pencil color="black" className="h-5 w-5 inline-block" />
                      </button>
                      <button className="px-3" // onClick={() => handleDeleteDocument(doc.document_id)}
                      >
                        <Trash2 color="black" className="h-5 w-5 inline-block" />
                      </button>
                    </div>      
              

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
    </div>
  );
}
