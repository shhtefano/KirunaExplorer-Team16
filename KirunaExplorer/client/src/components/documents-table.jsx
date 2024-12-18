import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import { DocumentInfoModal } from "./link-list.jsx";
import LinkIcon from "@mui/icons-material/Link";

import DeleteIcon from "@mui/icons-material/Delete"; // Importa l'icona
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
import EditDocumentForm from "./EditDocumentForm.jsx";

export default function DocumentsTable() {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStakeholder, setSelectedStakeholder] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [dateFilterMode, setDateFilterMode] = useState("exact");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // To control Dialog for delete confirmation
  const [documentToDelete, setDocumentToDelete] = useState(null); // To store the document that needs to be deleted
  const [openEditDialog, setOpenEditDialog] = useState(false); // To control Dialog for Edit
  const [documentToEdit, setDocumentToEdit] = useState(null); // To store the document that needs to be Edited
  const [areaNames, setAreaNames] = useState({});
  const [selectedMapDocument, setSelectedMapDocument] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showLinkInterface, setShowLinkInterface] = useState(false);
  const [refreshLinks, setRefreshLinks] = useState(false);
  const [showLinks, setShowLinks] = useState({});
  const [types, setTypes] = useState([]);
  const [stakeholderNames, setStakeholderNames] = useState([]);
  const languages = ["All", "English", "Swedish"];
  const [showEditModal, setShowEditModal] = useState(false); // Controlla la visibilità del modal

  const { user } = useAuth();

  useEffect(() => {
    // Fetch the area name for each document once the documents are loaded
    const fetchAreaNames = async () => {
      const newAreaNames = {};
      for (const doc of documents) {
        const areaNameResult = await API.getAreaNameByDocumentId(
          doc.document_id
        ); // Assuming document_id exists in the document object
        if (areaNameResult.success) {
          newAreaNames[doc.document_id] = areaNameResult.area_name;
        } else {
          newAreaNames[doc.document_id] = "Unknown"; // Fallback if no area name is found
        }
      }
      setAreaNames(newAreaNames);
    };

    if (documents.length > 0) {
      fetchAreaNames();
    }
  }, [documents]); // Fetch area names when the documents state changes

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

  useEffect(() => {
    if (!selectedDocument) {
      setShowLinkInterface(false);
      setRefreshLinks((prev) => !prev);
    }
  }, [selectedDocument]);

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

  const handleEditClick = (document) => {
    setDocumentToEdit(document); // Imposta il documento selezionato
    setShowEditModal(true); // Mostra il modal
  };

  const closeEditModal = () => {
    setShowEditModal(false); // Chiudi il modal
    setDocumentToEdit(null); // Resetta il documento selezionato
  };

  //Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto p-6 pb-6 bg-white rounded shadow-md overflow-auto">
      <div className="text-gray-700">
        <div
          className="mb-3"
          style={{ display: "flex", flexDirection: "row", gap: "28px" }}
        >
          <div className="mt-1  text-gray-700" style={{ width: "20%" }}>
            <p className="font-semibold mb-2">Document Type:</p>
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

          <div className=" mt-1 text-gray-700" style={{ width: "20%" }}>
            <p className="font-semibold mb-2">Language:</p>
            <Select
              onValueChange={setSelectedLanguage}
              value={selectedLanguage}
            >
              <SelectTrigger
                data-cy="language-select"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
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

          <div className=" mt-1 text-gray-700" style={{ width: "20%" }}>
            <p className="font-semibold mb-2">Stakeholders:</p>
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

        <p className="font-semibold mb-2 mt-6">Issuance Date:</p>
        <div className="flex items-center gap-4">
          <Select
            onValueChange={setDateFilterMode}
            defaultValue={dateFilterMode}
          >
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

      {/**search by title and keywords */}
      <div
        className="mt-4 mb-2"
        style={{
          display: "flex",
          // justifyContent: 'center', // Centrare gli input
          // alignItems: 'center',
          width: "100%",
          gap: "20px", // Spaziatura tra gli input
          padding: "20px 0", // Aggiungi un po' di spazio verticale
        }}
      >
        {/* Search by title of documents */}
        <div
          style={{
            flex: 1, // Permette agli input di occupare lo stesso spazio disponibile
            maxWidth: "300px", // Limita la larghezza massima
          }}
        >
          <Input
            placeholder="Search by document title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Search based on keywords in the description of documents */}
        <div
          style={{
            flex: 1,
            maxWidth: "400px",
          }}
        >
          <Input
            placeholder="Search keywords in document description..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      <Table className="border rounded table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Title</TableHead>
            <TableHead className="w-1/5">Issuance Date</TableHead>
            <TableHead className="w-1/5">Type</TableHead>
            {/* <TableHead className="w-1/5">Language</TableHead> */}
            <TableHead className="w-1/5">Area</TableHead>
            <TableHead className="w-1/3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDocuments.length > 0 ? (
            paginatedDocuments.map((doc) => (
              <TableRow key={doc.document_title} className="hover:bg-gray-50">
                <TableCell className="py-2 px-4 truncate">
                  {doc.document_title}
                </TableCell>
                <TableCell className="py-2 px-4">{doc.issuance_date}</TableCell>
                <TableCell className="py-2 px-4">{doc.document_type}</TableCell>
                <TableCell className="py-2 px-4">
                  {areaNames[doc.document_id] || "Loading..."}
                </TableCell>
                <TableCell className="py-2 px-4">
                  <div className="flex">
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            style={{ backgroundColor: "black", color: "white" }}
                            className="px-3 py-1 text-sm text-white rounded"
                            title="Open Document"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowLinkInterface(false);
                              setRefreshLinks((prev) => !prev);
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
                                  refreshLinks={refreshLinks}
                                  setRefreshLinks={setRefreshLinks}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  fontSize: "16px",
                                  margin: "10px",
                                  overflowY: "auto",
                                }}
                              >
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

                    <Dialog>
                      <DialogTrigger asChild>
                        {user?.role === "urban_planner" && (
                          <button
                            style={{ backgroundColor: "white", color: "black" }}
                            className="px-2 ml-2"
                            title="Connections"
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowLinks(true);
                              setShowLinkInterface(false);
                              setRefreshLinks((prev) => !prev);
                            }}
                          >
                            <LinkIcon alt="Show Links" label="Show Links" />
                          </button>
                        )}
                      </DialogTrigger>
                      <DialogContent
                        className="p-6 bg-white rounded-lg shadow-lg"
                        style={{
                          maxHeight: "80vh", // Altezza massima del dialog responsivo
                          overflowY: "auto", // Abilita lo scorrimento verticale
                          width: "90vw", // Larghezza massima (per i dispositivi mobili)
                          maxWidth: "600px", // Larghezza massima per desktop
                        }}
                      >
                        <DialogTitle className="text-xl font-bold text-gray-800">
                          {selectedDocument?.document_title + " Connections"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-700">
                          {selectedDocument && showLinks && (
                            <Links
                              showLinkInterface={showLinkInterface}
                              setShowLinkInterface={setShowLinkInterface}
                              selectedDocument={selectedDocument}
                              setSelectedDocument={setSelectedDocument}
                              refreshLinks={refreshLinks}
                              setRefreshLinks={setRefreshLinks}
                            />
                          )}
                        </DialogDescription>
                      </DialogContent>
                    </Dialog>

                    <div className="ml-2">
                      {user?.role === "urban_planner" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="px-3 py-1 text-sm border border-black rounded hover:bg-gray-100"
                              title="Upload Resources"
                            >
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
                            title="Map"
                            onClick={() => {
                              setSelectedMapDocument(doc);
                            }}
                          >
                            <MapIcon
                              color="black"
                              alt="Open Map"
                              label="Open Map"
                            />
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

                    <div>
                      {user?.role === "urban_planner" && (
                        <Dialog
                        // open={openEditDialog}
                        // onOpenChange={setOpenEditDialog} // Update state when the dialog is closed via outside click or Cancel
                        >
                          {/* <DialogTrigger asChild> */}
                          <button
                            style={{
                              backgroundColor: "transparent",
                              color: "black",
                            }}
                            title="Edit Document"
                            onClick={() => handleEditClick(doc)}
                          >
                            <Pencil
                              color="black"
                              className="h-5 w-5 inline-block"
                            />
                          </button>
                          {/* </DialogTrigger> */}
                          <DialogContent
                            className=" bg-white rounded-lg shadow-lg"
                            style={{
                              maxHeight: "80vh",
                              overflowY: "auto",
                              maxWidth: "50vw",
                              transition:
                                "opacity 0.2s ease-in-out, transform 0.2s ease-in-out", // Riduci la durata
                              opacity: 1, // Assicurati che il contenuto sia visibile immediatamente
                              transform: "scale(1)", // Elimina eventuali effetti di zoom
                            }}
                          >
                            <DialogTitle className="text-xl font-bold text-gray-800">
                              Edit {documentToEdit?.document_title || ""}
                            </DialogTitle>
                            <EditDocumentForm
                              documentTitle={
                                documentToEdit?.document_title || ""
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

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
                              title="Delete Document"
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

      {/* Modal per modificare il documento */}
      {showEditModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto"
          style={{ transition: "opacity 0.3s ease-in-out", padding: "20px" }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-5xl w-full"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
              maxWidth: "800px",
              width: "100%",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="text-xl font-bold text-center">
                Edit Document: {documentToEdit?.document_title}
              </h2>
              <Button
                variant="outline"
                style={{ backgroundColor: "red", marginLeft: "30px" }}
                onClick={closeEditModal}
              >
                <p style={{ color: "white" }}>X</p>
              </Button>
            </div>
            <EditDocumentForm
              documentTitle={documentToEdit?.document_title || ""}
              onClose={closeEditModal}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center items-center">
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

export function Links({
  showLinkInterface,
  setShowLinkInterface,
  selectedDocument,
  setSelectedDocument,
  refreshLinks,
  setRefreshLinks,
}) {
  const [docToLink, setDocToLink] = useState(null);
  const [links, setLinks] = useState([]);
  const [showDocInfo, setShowDocInfo] = useState(false);

  useEffect(() => {
    if (!selectedDocument) {
      setShowLinkInterface(false);
    }
  }, [selectedDocument]);
  const handleClickDoc = (docId, connectionType) => {
    console.log("DOCUMENTO SELEZIONATO", docId); // Verifica che l'ID sia corretto
    setDocToLink(docId); // Imposta prima il documento
    setShowDocInfo(true); // Mostra il modal secondario
    console.log("doc:", docToLink, "selectedDocument", selectedDocument);
  };

  useEffect(() => {
    const fetchLinks = async () => {
      if (selectedDocument) {
        try {
          const data = await API.getConnectionsByDocumentTitle(
            selectedDocument.document_title
          );
          setLinks(data.data || []);
        } catch (error) {
          console.error("Error fetching links:", error);
          setLinks([]);
        }
      }
    };

    fetchLinks();
  }, [selectedDocument, refreshLinks]);
  const handleDeleteConnection = async (doc1_id, doc2_id, connection_type) => {
    const result = await API.deleteConnection(
      doc1_id,
      doc2_id,
      connection_type
    );

    if (result.success) {
      // Rimuovi la connessione dalla lista
      setLinks((prevConnections) =>
        prevConnections.filter(
          (conn) =>
            !(
              conn.parent_id === doc1_id &&
              conn.children_id === doc2_id &&
              conn.connection_type === connection_type
            )
        )
      );

      // Reset stato
      setSnackbarMsg("Connection deleted successfully");
      setOpenSnackbar(true);
      setErrorSeverity("success");
      setRefreshLinks((prev) => !prev);
    } else {
      setSnackbarMsg("Failed to delete connection");
      setOpenSnackbar(true);
      setErrorSeverity("error");
    }
  };

  return (
    <>
      {!showLinkInterface &&
        (links.length > 0 ? (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {links.map((link, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", width: "70%" }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between" // Allinea il contenuto a sinistra e destra
                    spacing={1}
                    style={{ width: "100%" }}
                  >
                    {/* Contenitore principale per i bottoni e freccia */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <button
                        onClick={() =>
                          handleClickDoc(link.parent_id, link.connection_type)
                        }
                        style={{
                          background: "none",
                          border: "1px solid #ccc",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          color: "#333",
                          fontSize: "14px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.parent_id}
                      </button>
                      <Typography
                        variant="body2"
                        style={{ color: "#555", textTransform: "lowercase" }}
                      >
                        →
                      </Typography>
                      <button
                        onClick={() =>
                          handleClickDoc(link.children_id, link.connection_type)
                        }
                        style={{
                          background: "none",
                          border: "1px solid #ccc",
                          padding: "6px 12px",
                          borderRadius: "10px",
                          color: "#333",
                          fontSize: "14px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {link.children_id}
                      </button>
                    </Stack>

                    {/* Tipo connessione e pulsante eliminazione */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ textTransform: "lowercase", fontSize: "12px" }}
                      >
                        Type: <strong>{link.connection_type}</strong>
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() =>
                          handleDeleteConnection(
                            link.parent_id,
                            link.children_id,
                            link.connection_type
                          )
                        }
                        style={{ minWidth: "30px", padding: "4px 6px" }} // Ridotto
                      >
                        <Trash2 size={14} /> {/* Icona più piccola */}
                      </Button>
                    </Stack>
                  </Stack>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No Connections available for this document...</p>
        ))}

      {/* Pulsante per mostrare l'interfaccia di linking */}
      {!showLinkInterface && (
        <Button
          variant="outline"
          style={{
            backgroundColor: "black",
            color: "white",
          }}
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={() => {
            setShowLinkInterface(true);
            setShowDocInfo(false);
            setRefreshLinks((prev) => !prev);
          }}
        >
          Link Documents
        </Button>
      )}

      {/* Modal o interfaccia secondaria */}
      {docToLink && showDocInfo && (
        <DocumentInfoModal
          doc={docToLink}
          showDocInfo={showDocInfo}
          setShowDocInfo={setShowDocInfo}
          selectedDocument={selectedDocument}
        />
      )}

      {/* Interfaccia per linkare documenti con pulsante indietro */}
      {showLinkInterface && (
        <div className="mt-6 border-t pt-1">
          {/* Pulsante per tornare alla lista dei link */}
          <Button
            variant="outline"
            style={{
              backgroundColor: "black",
              color: "white",
            }}
            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => {
              setShowLinkInterface(false);
              setRefreshLinks((prev) => !prev);
            }}
          >
            ← Back to Connections
          </Button>

          {/* Componente per il linking dei documenti */}
          <div className="mt-6 p-4 bg-white shadow-lg rounded-lg">
            <DocumentLink
              initialDocument={selectedDocument}
              refreshLinks={refreshLinks}
              setRefreshLinks={setRefreshLinks}
            />
          </div>
        </div>
      )}
    </>
  );
}
