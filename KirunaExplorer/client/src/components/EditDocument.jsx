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
  import DocumentLinkOnCreation from "./creation-document-link.jsx";
  import Snackbar from "@mui/material/Snackbar";
  import Alert from "@mui/material/Alert";
  import MapIcon from "@mui/icons-material/Map";
  import API from "../services/API";
import { useNavigate, useParams } from "react-router-dom"; // For routing and params

const EditDocument = () => {
  const [documentData, setDocumentData] = useState(null);
  const [types, setTypes] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const form = useForm();
  const navigate = useNavigate();
  //const { documentId } = useParams(); // Get the documentId from URL
  const documentTitle = "Kiruna Buildings";
  useEffect(() => {
    // Fetch document data and populate form
    const fetchDocumentData = async () => {
      try {
        const response = await API.getDocumentById(documentTitle);
        setDocumentData(response);
        form.reset({
          document_title: response.document_title,
          document_description: response.document_description,
          document_type: response.document_type,
          stakeholders: response.stakeholders,
          scale: response.scale,
          issuance_date: response.issuance_date,
          language: response.language,
          pages: response.pages,
          area_name: response.area_name,
          latitude: response.latitude,
          longitude: response.longitude,
        });
      } catch (error) {
        console.error("Error fetching document data:", error);
      }
    };

    const fetchDocumentTypes = async () => {
      try {
        const response = await API.getDocumentTypes();
        setTypes(response);
      } catch (error) {
        console.error("Error fetching document types:", error);
      }
    };

    fetchDocumentData();
    fetchDocumentTypes();
  }, [documentTitle]);

  const handleSubmit = async (data) => {
    setIsPending(true);
    try {
      const response = await API.updateDocument(documentId, data);
      if (response.error) {
        setToastMessage(response.error.message);
      } else {
        setToastMessage("Document updated successfully.");
        navigate(`/document/${documentId}`); // Redirect after successful update
      }
    } catch (error) {
      setToastMessage("An error occurred while updating the document.");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  if (!documentData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card className="min-w-[280px] max-w-[750px]">
        <CardContent>
          <h1 style={{ marginTop: '20px', fontSize: '22px' }}><strong>Edit Document</strong></h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Document Title */}
              <FormField control={form.control} name="document_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Document Title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Document Description */}
              <FormField control={form.control} name="document_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Document Description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Document Type */}
              <FormField control={form.control} name="document_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map(type => (
                          <SelectItem key={type.id} value={type.type_name}>
                            {type.type_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Stakeholders */}
              <FormField control={form.control} name="stakeholders" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stakeholders</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {/* Render checkboxes for stakeholders */}
                      {documentData.stakeholders.map(stakeholder => (
                        <div key={stakeholder}>
                          <input
                            type="checkbox"
                            checked={field.value.includes(stakeholder)}
                            onChange={(e) => {
                              const updatedStakeholders = e.target.checked
                                ? [...field.value, stakeholder]
                                : field.value.filter(item => item !== stakeholder);
                              field.onChange(updatedStakeholders);
                            }}
                          />
                          <label>{stakeholder}</label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Scale */}
              <FormField control={form.control} name="scale" render={({ field }) => (
                <FormItem>
                  <FormLabel>Scale</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Scale" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Issuance Date */}
              <FormField control={form.control} name="issuance_date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Issuance Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Issuance Date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Language */}
              <FormField control={form.control} name="language" render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Language" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Pages */}
              <FormField control={form.control} name="pages" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pages</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="Pages" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Button type="submit" disabled={isPending}>Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {toastMessage && <div>{toastMessage}</div>}
    </div>
  );
};

export default EditDocument;


/*{import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import CoordsMap from "./CoordsMap";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import API from "../services/API";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const EditDocument = ({ documentId, initialData, onSave }) => {
  const [isPending, setIsPending] = useState(false);
  const [showPopupMap, setShowPopupMap] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const form = useForm({
    defaultValues: initialData,
  });

  const handleSubmit = async (values) => {
    setIsPending(true);
    try {
      const updatedData = {
        ...values,
        coordinates: {
          lat: values.latitude,
          long: values.longitude,
        },
      };
      delete updatedData.latitude;
      delete updatedData.longitude;

      await API.updateDocument(documentId, updatedData);
      setToast({ open: true, message: "Document updated successfully", severity: "success" });
      onSave();
    } catch (error) {
      console.error("Error updating document:", error);
      setToast({ open: true, message: "Failed to update document", severity: "error" });
    } finally {
      setIsPending(false);
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

  return (
    <div>
      <Card className="min-w-[280px] max-w-[750px]">
        <CardContent>
          <h1 style={{ marginTop: '20px', fontSize: '22px' }}>
            <strong>Edit Document</strong>
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Document title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="document_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Document description" className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.000001" placeholder="Latitude" />
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
                      <Input {...field} type="number" step="0.000001" placeholder="Longitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <Button type="button" onClick={() => setShowPopupMap(true)} variant="outline">
                  Open Map
                </Button>
              </div>

              {showPopupMap && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-4 rounded shadow-lg text-center">
                    <CoordsMap setShowPopupMap={setShowPopupMap} onSubmitCoordinates={onSubmitCoordinates} />
                    <Button type="button" onClick={() => setShowPopupMap(false)} className="mt-4" variant="outline">
                      Close Map
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button type="submit" disabled={isPending} variant="outline">
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast}>
        <Alert onClose={handleCloseToast} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditDocument;}*/
