import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import CoordsMap from "./CoordsMap";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  documentRules,
  descriptionRules,
  issuanceRules,
  scaleRules,
  stakeholderRules,
  typeRules,
} from "@/rules/document-description";
import { DialogFooter } from "@/components/ui/dialog";
import { useState, useTransition, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import API from "../services/API";
import DocumentLinkOnCreation from "./creation-document-link.jsx";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MapIcon from "@mui/icons-material/Map";
import { RestorePageOutlined } from "@mui/icons-material";
import { Trash2 } from "lucide-react";


// const stakeholders = [
//   "LKAB",
//   "Municipality",
//   "Regional authority",
//   "Architecture firms",
//   "Citizens",
//   "Others",
// ];

const EditDocumentForm = (props) => {
  const [types, setTypes] = useState([]);
  const [isWholeArea, setIsWholeArea] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPopupMap, setShowPopupMap] = useState(false);
  const [showPopupLink, setShowPopupLink] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stakeholderInput, setStakeholderInput] = useState('');
  const [newDocumentType, setNewDocumentType] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [temporaryLinks, setTemporaryLinks] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const form = useForm({
    defaultValues: {
      document_title: "",
      document_description: "",
      document_type: "",
      stakeholders: [],
      scale: "",
      issuance_date: "",
      language: "",
      pages: "",
    },
  });
  const oldTitle = props.documentTitle;


  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(oldTitle)
        const response = await API.getDocumentById(oldTitle);
        const documentData = response.data || null;

        if (documentData) {
          // Aggiorna i valori del modulo con i dettagli ricevuti
          form.reset({
            document_title: documentData.document_title || "",
            document_description: documentData.document_description || "",
            document_type: documentData.document_type || "",
            stakeholders: documentData.stakeholders || [],
            scale: documentData.scale || "",
            issuance_date: documentData.issuance_date || "",
            language: documentData.language || "",
            pages: documentData.pages || "",
          });
        }

        setDocumentDetails(documentData);
        console.log(documentData);
      } catch (err) {
        console.error("Error fetching document details:", err);
        setError("Unable to fetch document details.");
        setDocumentDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [props.documentTitle, form]);

  // Aggiungere un nuovo tipo di documento
  const handleAddDocumentType = async () => {
    const trimmedType = newDocumentType.trim();
    try {
      const result = await API.addDocumentType(trimmedType);

      if (trimmedType && !types.some((doc) => doc.type === trimmedType)) {
        console.log(result?.data.type_name, 'aaaaa')
        setTypes((prev) => [...prev, { type: result?.data.type_name }]);
        setNewDocumentType("");
        setToast({
          open: true,
          severity: "success",
          message: "Document type added successfully.",
        });
      } else {
        setToast({
          open: true,
          severity: "error",
          message: "Type already exists or is invalid.",
        });
      }
    } catch (error) {
      console.error("Error adding document type:", error);
      setToast({
        open: true,
        severity: "error",
        message: error.message || "An error occurred while adding the document type.",
      });
    }
  };

  const onSaveTemporaryLinks = () => {
    setShowPopupLink(false); // Close the dialog after saving links
  };

  const onSubmit = async (values) => {
    // Verifica che i dati siano validi prima di continuare
    if (!values.stakeholders || values.stakeholders.length === 0) {
      setToast({
        open: true,
        message: "Stakeholders missing",
        severity: "error",
      });
      return; // Fermati qui se manca qualcosa di obbligatorio
    }

    startTransition(async () => {
      const body = {
        oldTitle,
        ...values,
        scale: values.scale.replace(/\s+/g, ""),
      };

      try {
        const response = await API.updateDocument(body);
        setDocumentId(response.documentId);

        // Save links only if there are any
        if (temporaryLinks.length > 0) {
          await onSaveLinks(response.documentId); // Pass the documentId directly
        }

        form.reset();

        // Verifica la risposta
        if (response.error) {
          setToast({
            open: true,
            message: response.error.toString(),
            severity: "error",
          });
        } else {
          setToast({
            open: true,
            message: "Document description added",
            severity: "success",
          });
          form.reset();

          if(response.error === "A document with the same title already exists."){
            setToast({ open: true, message: error.message, severity: "error" });
          } else {
          // Refresh della pagina solo se tutto è andato a buon fine
          window.location.reload();}
        }
      } catch (error) {
        setToast({ open: true, message: error.message, severity: "error" });
      }

      setTemporaryLinks([]);

      if(response.error === "A document with the same title already exists."){
        setToast({ open: true, message: error.message, severity: "error" });
      } else {
      // ** Chiudi il modal dopo il submit ** (anche se ci sono errori)
      props.onClose(); // Chiama la funzione onClose per chiudere il modal
      }
    });
  };
  


  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const documentTypesResponse = await API.getDocumentTypes();
        const types = documentTypesResponse.map((type) => ({
          type: type.type_name,
        }));
        setTypes(types); // Aggiorna lo stato con i tipi di documento recuperati
      } catch (error) {
        console.error("Errore durante il recupero dei tipi di documento:", error);
      }
    };

    fetchDocumentTypes();
  }, []);

  const onSaveLinks = async (docId) => {
    for (const link of temporaryLinks) {
      try {
        const payload = {
          from: link.from, // Title of the starting document
          to: link.to, // Title of the destination document
          type: link.type, // Link type
        };

        const response = await API.linkDocuments(
          payload.from,
          payload.to,
          payload.type
        );
      } catch (error) {
        console.error(`Error linking "${link.from}" to "${link.to}":`, error);
      }
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchStakeholders = async () => {
      setIsLoading(true);
      try {
        const data = await API.getStakeholders();
        const stakeholders = data.map(stakeholder => stakeholder.stakeholder_name);

        setStakeholders(stakeholders);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStakeholders();
  }, []);

  // Aggiungere un nuovo stakeholder
  const handleAddStakeholder = async (newStakeholderName) => {
    try {
      if (newStakeholderName.trim() === '') {
        setToast({
          open: true,
          message: 'Stakeholder name cannot be empty',
          severity: "error",
        });
        return;
      } else {
        const result = await API.addNewStakeholder(newStakeholderName);
        if (result === 201) {
          setStakeholders((prev) => [...prev, newStakeholderName]);
          setStakeholderInput('');
        }
      }
    } catch (error) {
      console.error('Error adding stakeholder:', error);
    }
  };

  const [geoAreas, setGeoAreas] = useState([]);

  useEffect(() => {
    const fetchGeoAreas = async () => {
      try {
        const data = await API.getGeoArea(); // Chiamata alla tua funzione API
        setGeoAreas(data); // Salva le aree nello stato
      } catch (error) {
        console.error("Errore durante il fetch delle aree geografiche:", error);
      }
    };

    fetchGeoAreas();
  }, []);

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

      <Card className="min-w-[280px] max-w-[800px] max-h-[100vh]">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7 mt-4">
              {/* Document Title */}
              <FormField
                control={form.control}
                name="document_title"
                rules={documentRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="document-title">Document *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Your document title"
                        id="document-title"
                        aria-label="document"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Document Description */}
              <FormField
                control={form.control}
                name="document_description"
                rules={descriptionRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="document-description">
                      Description *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="document-description"
                        aria-label="description"
                        placeholder="Your document description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_type"
                rules={typeRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <div className="flex items-center space-x-4">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          style={{ zIndex: 9999 }} // Aggiungi z-index alto per la selezione
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent style={{ zIndex: 9999 }}> {/* Imposta z-index anche per il contenuto */}
                            {types.map((document) => (
                              <SelectItem key={document.type} value={document.type}>
                                {document.type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <div className="flex space-x-2 items-center">
                        <Input
                          type="text"
                          value={newDocumentType}
                          onChange={(e) => setNewDocumentType(e.target.value)}
                          placeholder="New type"
                          className="w-40"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddDocumentType}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stakeholder */}
              {/* Stakeholder */}
              {/* <FormField
                control={form.control}
                name="stakeholders"
                rules={stakeholderRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stakeholders *</FormLabel>
                    <FormControl>
                      <div className="space-y-2 flex flex-wrap">
                        {stakeholders.map((stakeholder) => (
                          <div key={stakeholder} className="flex items-center w-1/3 md:w-1/4 lg:w-1/5">
                            <input
                              type="checkbox"
                              id={stakeholder}
                              value={stakeholder}
                              checked={field.value.includes(stakeholder)} // Verifica se è selezionato
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                let updatedStakeholders = [...field.value];
                                if (isChecked) {
                                  updatedStakeholders.push(stakeholder); // Aggiungi
                                } else {
                                  updatedStakeholders = updatedStakeholders.filter(item => item !== stakeholder); // Rimuovi
                                }
                                field.onChange(updatedStakeholders); // Aggiorna il valore del form
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={stakeholder}>{stakeholder}</label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-2 items-center">
                <Input
                  type="text"
                  value={stakeholderInput}
                  onChange={(e) => setStakeholderInput(e.target.value)}
                  placeholder="New Stakeholder"
                  className="w-40" // Aggiungi questa classe
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddStakeholder(stakeholderInput)}
                >
                  <p style={{ textAlign: 'center' }}>Add</p>
                </Button>
              </div> */}


              {/* Stakeholder */}
              <FormField
                control={form.control}
                name="stakeholders"
                rules={stakeholderRules}
                render={({ field }) => {
                  const [searchQuery, setSearchQuery] = useState('');
                  const filteredStakeholders = stakeholders.filter((stakeholder) =>
                    stakeholder.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  return (
                    <FormItem>
                      <FormLabel>Stakeholders *</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl>
                          <Select
                            onValueChange={(selectedValue) => {
                              if (!field.value.includes(selectedValue)) {
                                field.onChange([...field.value, selectedValue]);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Stakeholder" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-auto">
                        
                              <div className="p-2">
                                <Input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search stakeholders"
                                  className="w-full mb-2"
                                />
                              </div>
                          
                              {filteredStakeholders.map((stakeholder) => (
                                <SelectItem key={stakeholder} value={stakeholder}>
                                  {stakeholder}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <div className="flex space-x-2 items-center">
                          <Input
                            type="text"
                            value={stakeholderInput}
                            onChange={(e) => setStakeholderInput(e.target.value)}
                            placeholder="New Stakeholder"
                            className="w-40"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              handleAddStakeholder(stakeholderInput);
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="mt-2">
                          <h4 className="font-semibold">Selected Stakeholders:</h4>
                          <ul className="space-y-1">
                            {field.value.map((selectedStakeholder, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <span>{selectedStakeholder}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="small"
                                  onClick={() => {
                                    field.onChange(field.value.filter((item) => item !== selectedStakeholder));
                                  }}
                                >
                                  <Trash2 />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

            
            


              <div className="d-flex space-x-8">

                {/* Scale */}
                <FormField
                  control={form.control}
                  name="scale"
                  rules={scaleRules}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scale *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          style={{ width: '100%' }}
                          type="text"
                          placeholder="1 : 100"
                        ></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {/* Issuance Date */}
                <FormField
                  control={form.control}
                  name="issuance_date"
                  rules={issuanceRules}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issuance date *</FormLabel>
                      <FormControl>
                        <Input
                          style={{ width: '100%' }}

                          {...field}
                          type="text"
                          placeholder="YYYY/MM/DD - YYYY/MM - YYYY"
                        ></Input>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              
              {/* Language */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input
                        style={{ width: '100%' }}
                        {...field}
                        type="text"
                        placeholder="E.g Swedish"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Pages */}
              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pages</FormLabel>
                    <FormControl>
                      <Input
                        style={{ width: '70%' }}

                        min="0"
                        step="1"
                        {...field}
                        type="number"
                        placeholder="0"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              </div>


              <div className="flex items-center justify-center">

                <div className="flex flex-col gap-y-2 items-start" >
                  <Button
                    type="submit"
                    disabled={isPending}
                    variant="outline"
                    style={{ color: "white", backgroundColor: "black" }}
                  >
                    Confirm
                  </Button>

                </div>

              </div>
              {/* <div>
                {temporaryLinks.length > 0 && (
                  <div >
                    <h3 className="text-sm font-semibold">
                      Temporary Links:
                    </h3>
                    <div className="list-disc">
                      {temporaryLinks.map((link, index) => (
                        <div key={index} className="text-md">
                          {index + 1}{`)`} {link.from} <b>{`<->`}</b> {link.to} ({link.type})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div> */}
            </form>
          </Form>
        </CardContent>
        {/* <CardFooter className="flex justify-between"></CardFooter> */}
      </Card>

      {/* Material UI Snackbar for Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditDocumentForm;
