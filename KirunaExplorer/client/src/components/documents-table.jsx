import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import API from "../services/API.js";
import DocumentLink from "./document-link.jsx";
import DocumentMap from "./DocumentMap.jsx"; // Importa il componente mappa
import FileUpload from "./FileUpload2.jsx";
import { MapIcon, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";




export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("all");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // To control Dialog for delete confirmation
  const [documentToDelete, setDocumentToDelete] = useState(null); // To store the document that needs to be deleted
  const { user } = useAuth();

  const [types, setTypes] = useState([]);
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const fetchedTypes = await API.getDocumentTypes();
        setTypes(fetchedTypes);
      } catch (err) {
        console.error("Error fetching document types:", err);
      }
    };
    fetchTypes();
  }, []);

  const [stakeholderNames, setStakeholderNames] = useState([]);
  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        const fetchedStakeholders = await API.getStakeholders();
        const stakeholderNames = fetchedStakeholders.map(
          (stakeholder) => stakeholder.stakeholder_name
        );
        setStakeholderNames(["All", ...stakeholderNames]);
      } catch (err) {
        console.error("Error fetching stakeholders:", err);
      }
    };
    fetchStakeholders();
  }, []);

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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.document_title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesDescription = doc.document_description
      ?.toLowerCase()
      .includes(searchKeyword.toLowerCase());
    
    const matchesType =
      selectedType && selectedType !== "All"
        ? doc.document_type === selectedType
        : true;

    const matchesStakeholder =
      selectedStakeholder && selectedStakeholder !== "All"
        ? (doc.stakeholders || []).includes(selectedStakeholder)
        : true;

    const matchesLanguage =
      selectedLanguage && selectedLanguage !== "All"
        ? doc.language === selectedLanguage
        : true;

    // Filter by year, month, day
    const matchesDate = (() => {
      // Return true if no date filter is selected
      if (dateFilterMode === "all" || (!year && !month && !day)) return true;

      const docDate = new Date(doc.issuance_date);

      if (dateFilterMode === "year" && year) {
        return docDate.getFullYear() === parseInt(year);
      } else if (dateFilterMode === "month" && year && month) {
        return (
          docDate.getFullYear() === parseInt(year) &&
          docDate.getMonth() === parseInt(month) - 1
        );
      } else if (dateFilterMode === "exact" && year && month && day) {
        return (
          docDate.getFullYear() === parseInt(year) &&
          docDate.getMonth() === parseInt(month) - 1 &&
          docDate.getDate() === parseInt(day)
        );
      }

      return true; // Default to true if no specific condition matches
    })();


    return (
      matchesSearch &&
      matchesDescription &&
      matchesType &&
      matchesLanguage &&
      matchesDate &&
      matchesStakeholder
    );
  });

  //Handle the Delete Button Click
  const handleDeleteDocument = async (id) => {
    try {
      await API.deleteDocument(id);
      console.log("Document deleted successfully");
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  //Pagination
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


      <div style={{display: 'flex', justifyContent:'space-between'}}>

      <div className="mb-6  text-gray-700" style={{width: '20%'}}>
        <p className="font-semibold mb-2">Select Document Type:</p>
        <Select onValueChange={setSelectedType} value={selectedType}>
          <SelectTrigger className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="All" value="All">
              All
            </SelectItem>
            {types.map((type) => (
              <SelectItem key={type.type_id} value={type.type_name}>
                {type.type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <div className=" mb-6 text-gray-700" style={{width: '20%'}}>
        <p className="font-semibold mb-2">Select Language:</p>
        <Select onValueChange={setSelectedLanguage} value={selectedLanguage}>
          <SelectTrigger data-cy="language-select" className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
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

      <div className=" mb-6 text-gray-700" style={{width: '20%'}}>
        <p className="font-semibold mb-2">Select Stakeholder:</p>
        <Select
          onValueChange={setSelectedStakeholder}
          value={selectedStakeholder}
        >
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
      </div>


      <div className="mb-6 text-gray-700">
  <p className="font-semibold mb-2 mt-1">Select by Issuance Date:</p>
  <div className="flex items-center gap-4">
    <Select onValueChange={setDateFilterMode} defaultValue={dateFilterMode}>
      <SelectTrigger className="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="year">Year</SelectItem>
        <SelectItem value="month">Month & Year</SelectItem>
        <SelectItem value="exact">Exact Date</SelectItem>
      </SelectContent>
    </Select>

    {dateFilterMode !== "all" && ( // Mostra i campi solo se non è selezionato "All"
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
    )}
  </div>
</div>

      {/* search by title of documents */}
      <div className="mb-6 mt-4 text-gray-700">
        {/* <p className="font-semibold mb-2">Search Document Title:</p> */}
        <Input
          placeholder="Search by document title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* search based on keywords in the description of documents */}
      <div className="mb-6 mt-4 text-gray-700">
        {/* <p className="font-semibold mb-2">Search Document Title:</p> */}
        <Input
          placeholder="Type Keywords"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <Table className="border rounded table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Title</TableHead>
            <TableHead className="w-1/5">Issuance Date</TableHead>
            <TableHead className="w-1/5">Type</TableHead>
            <TableHead className="w-1/5">Language</TableHead>
            <TableHead className="w-1/3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDocuments.length > 0 ? (
            paginatedDocuments.map((doc) => (
              <TableRow key={doc.document_title} className="hover:bg-gray-50">
                <TableCell className="py-2 px-4">
                  {doc.document_title}
                </TableCell>
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
                            {selectedDocument?.document_title ||
                              "No Document Selected"}
                          </DialogTitle>
                          <DialogDescription className="text-gray-700">
                            {showLinkInterface ? (
                              <div className="mt-6 border-t pt-4">
                                <DocumentLink
                                  initialDocument={selectedDocument}
                                />
                              </div>
                            ) : (
                              <div style={{ fontSize: "16px", margin: "10px" }}>
                                <p className="m-2">
                                  <strong>Stakeholders:</strong>{" "}
                                  {selectedDocument?.stakeholders?.length > 0
                                    ? selectedDocument.stakeholders.join(", ")
                                    : "No Stakeholders"}
                                </p>
                                <p className="m-2">
                                  <strong>Scale:</strong>{" "}
                                  {selectedDocument?.scale}
                                </p>
                                <p className="m-2">
                                  <strong>Issuance Date:</strong>{" "}
                                  {selectedDocument?.issuance_date}
                                </p>
                                <p className="m-2">
                                  <strong>Type:</strong>{" "}
                                  {selectedDocument?.document_type}
                                </p>
                                <p className="m-2">
                                  <strong>Language:</strong>{" "}
                                  {selectedDocument?.language}
                                </p>
                                <p className="m-2">
                                  <strong>Pages:</strong>{" "}
                                  {selectedDocument?.pages}
                                </p>
                                <div className="m-2 my-4">
                                  <p>
                                    <strong>Description:</strong>{" "}
                                    {selectedDocument?.document_description}
                                  </p>
                                </div>
                                {user?.role === "urban_planner" && (
                                  <Button
                                    variant="outline"
                                    style={{
                                      backgroundColor: "black",
                                      color: "white",
                                    }}
                                    className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                                    onClick={() => setShowLinkInterface(true)}
                                  >
                                    Link Documents
                                  </Button>
                                )}
                              </div>
                            )}
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="ml-2">
                      {user?.role === "urban_planner" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="px-3 py-1 text-sm border border-black rounded hover:bg-gray-100">
                              <Upload className="w-4 h-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl">
                            <DialogTitle>Upload Resources</DialogTitle>
                            <DialogDescription>
                              <FileUpload selectedDocument={doc} />
                            </DialogDescription>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            style={{ backgroundColor: "white", color: "black" }}
                            className="px-2 ml-2"
                            onClick={() => {
                              setSelectedMapDocument(doc);
                            }}
                          >
                            <MapIcon
                              color="black"
                              alt="Open Map"
                              label="Open Map"
                            ></MapIcon>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-6 bg-white rounded-lg shadow-lg">
                          <DialogTitle
                            className="text-xl font-bold text-gray-800"
                            style={{ backgroundColor: "transparent" }}
                          >
                            {doc.document_title} - Map View
                          </DialogTitle>
                          <DialogDescription className="mt-4">
                            <DocumentMap document_id={doc.document_id} />
                          </DialogDescription>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            style={{ backgroundColor: "white", color: "black" }}
                          >
                            <Pencil color="black" className="h-5 w-5 inline-block" />
                          </button>
                        </DialogTrigger>
                      </Dialog>
                    </div> */}

                    <div>
                      {user?.role === "urban_planner" && (
                        <Dialog
                          open={openDeleteDialog} // Controlled by openDeleteDialog state
                          onOpenChange={setOpenDeleteDialog} // Update state when the dialog is closed via outside click or Cancel
                        >
                          <DialogTrigger asChild>
                            <button
                              style={{
                                backgroundColor: "transparent",
                                color: "black",
                              }}
                              className="px-2"
                              onClick={() => {
                                setDocumentToDelete(doc); // Set the document to delete
                                setOpenDeleteDialog(true); // Open the delete confirmation dialog
                              }}
                            >
                              <Trash2
                                color="black"
                                className="h-5 w-5 inline-block"
                              />
                            </button>
                          </DialogTrigger>

                          <DialogContent className="p-4 bg-white rounded-lg shadow-lg">
                            <DialogTitle className="text-xl font-bold text-gray-800">
                              Confirm Deletion
                            </DialogTitle>
                            <DialogDescription className="text-gray-800 my-1">
                              Are you sure you want to delete this document?
                            </DialogDescription>
                            <DialogFooter>
                              <button
                                style={{
                                  backgroundColor: "black",
                                  color: "white",
                                }}
                                className="px-3 pb-1 text-sm text-white rounded"
                                onClick={() => {
                                  setOpenDeleteDialog(false); // Close dialog
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                style={{
                                  backgroundColor: "red",
                                  color: "white",
                                }}
                                className="px-3 pb-1 text-sm text-white rounded"
                                onClick={() => {
                                  handleDeleteDocument(
                                    documentToDelete.document_id
                                  ); // Call delete function
                                  setOpenDeleteDialog(false); // Close dialog
                                }}
                              >
                                Yes, Delete
                              </button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
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
                  className={
                    currentPage === index + 1 ? "font-bold text-blue-500" : ""
                  }
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
