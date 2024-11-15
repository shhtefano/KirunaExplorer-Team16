import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { useState, useTransition } from "react";
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

const documents = [
  {
    type: "Design",
    icon: null,
  },
  {
    type: "Informative",
    icon: null,
  },
  {
    type: "Technical",
    icon: null,
  },
  {
    type: "Prescriptive",
    icon: null,
  },
  {
    type: "Material Effects",
    icon: null,
  },
  {
    type: "Agreement",
    icon: null,
  },
  {
    type: "Conflict",
    icon: null,
  },
  {
    type: "Consultation",
    icon: null,
  },
];
const stakeholders = [
  "LKAB",
  "Municipality",
  "Regional authority",
  "Architecture firms",
  "Citizens",
  "Others",
];

const DocumentDescriptionForm = () => {
  const [isWholeArea, setIsWholeArea] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPopup, setShowPopup] = useState(false); // Nuovo stato per il popup
  const [documentId, setDocumentId] = useState(null);
  const [temporaryLinks, setTemporaryLinks] = useState([]);
  const form = useForm({ //initialized for uncontrolled component error
    defaultValues: {
      document_title: "",
      document_description: "",
      document_type: "",
      stakeholder: "",
      scale: "",
      issuance_date: "",
      language: "",
      pages: 0,
      latitude: 0,
      longitude: 0,
      link: ""
    },
  });

  const onSaveTemporaryLinks = (links) => {
    setShowPopup(false); // Close the dialog after saving links
    setTemporaryLinks(links);}

    const onSubmit = async (values) => {
      startTransition(async () => {
        console.log(values);
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
        console.log({ ...body });
      // Api request
        try {
          const response = await API.addDocumentDescription(body);
          toast.success("Document description added");
          setDocumentId(response.documentId); // Imposta il documentId
    
          // Salva i link solo se ci sono
          if (temporaryLinks.length > 0) {
            await onSaveLinks(response.documentId); // Passa il documentId direttamente
          }
    
          form.reset();
        
      } catch (error) {
        toast.error(error, {
          description: "",
      });
      }
    
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  };
 
  
  const onSaveLinks = async (docId) => {
    for (const link of temporaryLinks) {
      try {
        const payload = {
          from: link.from, // Titolo del documento di partenza
          to: link.to,     // Titolo del documento di destinazione
          type: link.type, // Tipo di collegamento
        };
  
        const response = await API.linkDocuments(payload.from, payload.to, payload.type);
  
        if (response.error) {
          toast.error(`Error linking "${link.from}" to "${link.to}": ${response.error}`);
        } else {
          toast.success(`Link saved: "${link.from}" to "${link.to}" (${link.type})`);
        }
      } catch (error) {
        toast.error(`An error occurred while linking "${link.from}" to "${link.to}".`);
        console.error(`Error linking "${link.from}" to "${link.to}":`, error);
      }
    }
  };
  
  const onSubmitCoordinates = (lat, long) => {
    setShowPopup(false);
    form.setValue("latitude", parseFloat(lat.toFixed(6)));
    form.setValue("longitude", parseFloat(long.toFixed(6)));
  };
 
  return (
    <div>
      <Card className="min-w-[280px] max-w-[700px]">
        <CardHeader>
          <CardTitle>Add document description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4">
            Here you can add a document description to the relating document.
            Choose the document from the dropdown menu and add you description
            in the text field.
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document_title"
                rules={documentRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Your document title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document_description"
                rules={descriptionRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
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
                    <FormLabel>Document type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documents.map((document) => (
                            <SelectItem
                              key={document.type}
                              value={document.type}
                            >
                              {document.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stakeholder"
                rules={stakeholderRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stakeholder</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stakeholder" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stakeholders.map((stakeholder) => (
                            <SelectItem key={stakeholder} value={stakeholder}>
                              {stakeholder}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scale"
                rules={scaleRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scale</FormLabel>
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
              <FormField
                control={form.control}
                name="issuance_date"
                rules={issuanceRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuance date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="YYYY-MM-DD / YYYY-MM / YYYY"
                      ></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name="connections"
                rules={connectionRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of connections</FormLabel>
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
              /> */}
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
              <FormField
                control={form.control}
                name="link"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <Dialog open={showPopup} onOpenChange={setShowPopup}>
                        <DialogTrigger asChild>
                          <Button variant="">Link documents</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[825px]">
                          <DialogHeader>
                            <DialogTitle>Link documents</DialogTitle>
                            <DialogDescription>
                              Link this document with other documents.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex p-2 justify-center items-center">
                            <ScrollArea className="h-[500px] p-2">
                              <DocumentLinkOnCreation onSave={onSaveTemporaryLinks}                   
                              initialDocumentTitle={form.watch("document_title")} // Passa il titolo del documento corrente
                              />
                            </ScrollArea>
                          </div>
                       {   /*<DialogFooter>
                            <Button
                              type="button"
                              onClick={() => {
                               
                              }}
                            >
                              Save links
                            </Button>
                          </DialogFooter>*/}
                        </DialogContent>
                      </Dialog>
                    </FormControl>
                    <FormMessage />
                    {temporaryLinks.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold">Temporary Links:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {temporaryLinks.map((link, index) => (
                            <li key={index} className="text-sm">{link.from} -- {link.to} ({link.type})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Map button and other fields */}
              <div className="flex gap-x-4 items-center">
                <FormField
                  control={form.control}
                  name="area_name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-2">
                      {" "}
                      {/* Disposizione verticale e centrata */}
                      <FormLabel
                        className="text-center"
                        style={{ paddingBottom: "22px" }}
                      >
                        {" "}
                        {/* Allinea la label al centro */}
                        Municipal area
                      </FormLabel>
                      <FormControl>
                        <Checkbox
                          {...field}
                          checked={field.value === "Whole Area"} // Checkbox is checked if value is "Whole Area"
                          onCheckedChange={(checked) => {
                            const value = checked ? "Whole Area" : ""; // Set to "Whole Area" if checked, otherwise empty
                            field.onChange(value); // Update the form's field value
                            setIsWholeArea(checked); // Optional: Update any additional component state
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div style={{ marginLeft: "30px", marginRight: "30px" }}>
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
                    onClick={() => setShowPopup(true)}
                    className="ml-2"
                  >
                    Open Map
                  </Button>
                </div>
              </div>
              {/* Popup per fornire informazioni su latitudine e longitudine */}
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div
                    className="bg-white p-6 rounded shadow-lg"
                    style={{ textAlign: "center" }}
                  >
                    <CoordsMap
                      setShowPopup={setShowPopup}
                      onSubmitCoordinates={onSubmitCoordinates}
                    />

                    <Button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="mt-4"
                    >
                      Close Map
                    </Button>
                  </div>
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: "60px" }}>
                <Button type="submit" disabled={isPending}>
                  Add document description
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
};

export default DocumentDescriptionForm;
