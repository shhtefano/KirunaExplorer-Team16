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
import { Trash2 } from "lucide-react";


// const stakeholders = [
//   "LKAB",
//   "Municipality",
//   "Regional authority",
//   "Architecture firms",
//   "Citizens",
//   "Others",
// ];

const DocumentDescriptionForm = () => {
  const [types, setTypes] = useState([]);
  const [isWholeArea, setIsWholeArea] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPopupMap, setShowPopupMap] = useState(false); // New state for the popup for linking document
  const [showPopupLink, setShowPopupLink] = useState(false); // New state for the popup for showing map
  const [stakeholders, setStakeholders] = useState([]); // Stato per gestire gli stakeholder esistenti
  const [isLoading, setIsLoading] = useState(false); // Stato di caricamento
  const [stakeholderInput, setStakeholderInput] = useState('');
  const [newDocumentType, setNewDocumentType] = useState(""); //stato per tipo documento

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
      area_name: "",
      latitude: "",
      longitude: "",
    },
  });// Aggiungere un nuovo tipo di documento
  const handleAddDocumentType = async () => {
    const trimmedType = newDocumentType.trim();
    try {
      // Try to add the document type through the API
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
      // Handle errors from the API or other issues
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
    startTransition(async () => {
      const body = {
        ...values,
        scale: values.scale.replace(/\s+/g, ""),
        coordinates: {
          lat: values.latitude,
          long: values.longitude,
        },
      };
      delete body.latitude;
      delete body.longitude;
      // API request
      try {

        if (body.stakeholders.length === 0) {
          setToast({
            open: true,
            message: "Stakeholders missing",
            severity: "error",
          });
          return;
        }

        if ((body.coordinates.lat === "" || body.coordinates.long === "") && body.area_name === "") {

          setToast({
            open: true,
            message: "Geolocation data missing",
            severity: "error",
          });
          return;
        } else if ((body.coordinates.lat === "" || body.coordinates.long === "") && body.area_name === "Kiruna Map") {
          // return
        } else if ((body.coordinates.lat !== "" || body.coordinates.long !== "") && body.area_name === "Kiruna Map") {
          body.coordinates = [];
          // return
        } else if ((body.coordinates.lat !== "" || body.coordinates.long !== "") && body.area_name !== "Kiruna Map") {
          // return
        }




        const response = await API.addDocumentDescription(body);
        // toast.success("Document description added");
        setDocumentId(response.documentId); // Set the documentId

        // Save links only if there are any
        if (temporaryLinks.length > 0) {
          await onSaveLinks(response.documentId); // Pass the documentId directly
        }

        form.reset();

        // Check if response contains an error
        if (response.error) {
          setToast({
            open: true,
            message: response.error.toString(),
            severity: "error",
          });
        } else {
          setToast({
            open: true,
            message: "Added document description",
            severity: "success",
          });
          form.reset();
        }
      } catch (error) {
        setToast({ open: true, message: error, severity: "error" });
      }

      /* setTimeout(() => {
        window.location.reload();
      }, 1000);*/
      setTemporaryLinks([]);
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

        if (response.error) {
          //  toast.error(`Error linking "${link.from}" to "${link.to}": ${response.error}`);
        } else {
          // toast.success(`Link saved: "${link.from}" to "${link.to}" (${link.type})`);
        }
      } catch (error) {
        // toast.error(`An error occurred while linking "${link.from}" to "${link.to}".`);
        console.error(`Error linking "${link.from}" to "${link.to}":`, error);
      }
    }
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const onSubmitCoordinates = (lat, long) => {
    setShowPopupMap(false);
    form.setValue("latitude", parseFloat(lat.toFixed(6)));
    form.setValue("longitude", parseFloat(long.toFixed(6)));
  };
  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentTitle = values.document_title;

      setTemporaryLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.from === currentTitle ||
            link.from === prevLinks.find((l) => l.from)?.from
            ? { ...link, from: currentTitle }
            : link
        )
      );
    });

    // Cleanup al dismontaggio del componente
    return () => subscription.unsubscribe();
  }, [form]);

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

  const [geoAreas, setGeoAreas] = useState([]); // Per salvare le aree geografiche
  //const [selectedGeoArea, setSelectedGeoArea] = useState(""); // Per tracciare l'area selezionata

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
    <div>

      <Card className="min-w-[280px] max-w-[750px]">
        <CardContent>

        <h1 style={{marginTop:'20px', fontSize:'22px'}}>
          <strong>Add new document</strong>        
          </h1>
          <div className="text-muted-foreground mt-4 mb-4">
            <i>

            Fill out this form to add metadata to a document. Language and pages
            are not mandatory. Please choose between an already existing area OR a single
            point with coordinates.
              </i>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              {/* Document Type */}
              <FormField
                    control={form.control}
                    name="document_type"
                    rules={typeRules}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type *</FormLabel>
                        <div className="flex items-center space-x-4">
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                          <div key={stakeholder} className="flex items-center w-1/2 md:w-1/3 lg:w-1/4">
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
                    </div>  */}


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
                              {/* Search field inside dropdown */}
                              <div className="p-2">
                                <Input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search stakeholders"
                                  className="w-full mb-2"
                                />
                              </div>
                              {/* Filtered dropdown items */}
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

                      {/* Display selected stakeholders */}
                      {field.value && field.value.length > 0 && (
                        <div className="mt-4">
                          <p style={{ fontSize: '14px', marginBottom:'10px' }} className="font-semibold">Selected:</p>
                          <ul className="space-y-4">
                            {field.value.map((selectedStakeholder, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <span>• {selectedStakeholder}</span>
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

              {/* Map button and other fields */}
              <div className="flex gap-x-2 items-center" style={{ marginTop: "50px" }}>
                <FormField
                  control={form.control}
                  name="area_name"
                  render={({ field }) => (
                    <FormItem style={{ marginBottom: "10px", marginLeft: "30px" }} className="flex flex-col gap-y-2 items-center">
                      {/* Disposizione verticale e centrata */}
                      <FormLabel
                        className="text-center"

                      >
                        {/* Allinea la label al centro */}
                        Select Area
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            form.setValue("latitude", "");
                            form.setValue("longitude", "");
                            form.setValue("area_name", value);
                            setIsWholeArea(value);
                          }}
                        >
                          <option value="">Point-Based Documents</option>
                          {geoAreas
                            .filter((area) => area.name !== "Point-Based Documents")
                            .map((area) => (
                              <option key={area.id} value={area.name}>
                                {area.name}
                              </option>
                            ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div style={{ marginLeft: "30px", marginRight: "40px" }}>
                  OR
                </div>

                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isWholeArea}
                          min="-90"
                          max="90"
                          step="0.000001"
                          {...field}
                          type="number"
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isWholeArea}
                          min="-180"
                          max="180"
                          step="0.000001"
                          {...field}
                          type="number"
                          placeholder="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Bottone per aprire il popup */}
                <div
                  style={{
                    textAlign: "center",
                    width: "10%",
                    marginTop: "30px",
                  }}
                >
                  <Button
                    type="button"
                    onClick={() => setShowPopupMap(true)}
                    className="ml-2"
                    variant="outline"
                  >
                    <MapIcon></MapIcon>
                  </Button>
                </div>
              </div>
              {/* Popup per fornire informazioni su latitudine e longitudine */}
              {showPopupMap && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div
                    className="bg-white p-4 rounded shadow-lg"
                    style={{ textAlign: "center" }}
                  >
                    <CoordsMap
                      setShowPopupMap={setShowPopupMap}
                      onSubmitCoordinates={onSubmitCoordinates}
                    />

                    <Button
                      type="button"
                      onClick={() => setShowPopupMap(false)}
                      className="mt-4"
                      variant="outline"
                    >
                      Close Map
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-x-2 items-center justify-center" style={{ marginTop: "40px" }}>

                <div>

                  <FormField
                    control={form.control}
                    name="link"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <Dialog
                            open={showPopupLink}
                            onOpenChange={setShowPopupLink}
                            style={{ border: "none" }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline">Link documents</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[805px] flex text-center items-center justify-center " style={{ border: "none" }}>
                              <div className="flex p-2 justify-center items-center text-center">
                                <ScrollArea className="h-[700px] p-2" style={{ width: "100%", border: "none" }}>
                                  <DocumentLinkOnCreation
                                    onSave={onSaveTemporaryLinks}
                                    initialDocumentTitle={form.watch(
                                      "document_title"
                                    )}
                                    temporaryLinks={temporaryLinks}
                                    setTemporaryLinks={setTemporaryLinks}
                                  // Passa il titolo del documento corrente
                                  />
                                </ScrollArea>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </FormControl>
                        <FormMessage />
                        
                      </FormItem>
                    )}
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <Button type="submit" disabled={isPending} variant="outline" style={{ color: "white", backgroundColor: "black" }}>
                    Add document description
                  </Button>
                </div>
              </div>
                    <div>
              {temporaryLinks.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold">
                              Temporary Links:
                            </h3>
                            <div className="list-disc">
                              {temporaryLinks.map((link, index) => (
                                <div key={index} className="text-md mt-4">
                                  {index+1}{`)`} {link.from} <b>{`<->`}</b> {link.to} ({link.type})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                    </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
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

export default DocumentDescriptionForm;
