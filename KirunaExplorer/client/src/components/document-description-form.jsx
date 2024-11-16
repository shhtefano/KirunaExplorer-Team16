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
  connectionRules,
} from "@/rules/document-description";
import { useState, useTransition } from "react";
import { Checkbox } from "./ui/checkbox";
import API from "../services/API";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MapIcon from '@mui/icons-material/Map';

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
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const form = useForm({
    defaultValues: {
      document_title: "",
      document_description: "",
      document_type: "",
      stakeholder: "",
      scale: "",
      issuance_date: "",
      language: "",
      pages: "",
      area_name: "",
      latitude: "",
      longitude: "",
    },
  });

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
      console.log({...body});
      // Api request
      try {
        const response = await API.addDocumentDescription(body);

        // Check if response contains an error
        if (response.error) {
          console.log(response.error);
          setToast({ open: true, message: response.error.toString(), severity: "error" });
        } else {

          console.log(response); // Logs the response status (e.g., 200)
          setToast({ open: true, message: "Added document description", severity: "success" });
          form.reset();
        }
      } catch (error) {
        setToast({ open: true, message: "An unexpected error occurred", severity: "error" });
      }

    });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const onSubmitCoordinates = (lat, long) => {
    setShowPopup(false);
    form.setValue("latitude", parseFloat(lat.toFixed(6)));
    form.setValue("longitude", parseFloat(long.toFixed(6)));
  }

  return (
    <div>
      <Card className="min-w-[280px] max-w-[700px]">
        <CardHeader>
          <CardTitle>Add new document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-4">
            Fill out this form to add metadata to a document. Language and pages are not mandatory. Please choose between 'Whole Area' OR a single point with coordinates.
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
              <div className="flex gap-x-4 items-center">

              <FormField
  control={form.control}
  name="area_name"
  render={({ field }) => (
    <FormItem className="flex flex-col items-center space-y-2"> {/* Disposizione verticale e centrata */}
      <FormLabel className="text-center" style={{ paddingBottom: "22px" }}> {/* Allinea la label al centro */}
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
<div style={{ marginLeft: "30px", marginRight:"30px" }}>

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
                <div style={{textAlign: "center", width:"10%", marginTop:"30px" }}>
                  <Button
                    type="button"
                    onClick={() => setShowPopup(true)}
                    className="ml-2"
                    variant="outline"
                  >
                    <MapIcon></MapIcon>
                  </Button>

                </div>
              </div>
              {/* Popup per fornire informazioni su latitudine e longitudine */}
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded shadow-lg"  style={{textAlign:"center" }}>
                    <CoordsMap
                      setShowPopup={setShowPopup}
                      onSubmitCoordinates={onSubmitCoordinates}
                    />
                
                    <Button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="mt-4"
                      variant="outline"
                      
                    >
                      Close Map
                    </Button>
                  </div>
                </div>
              )}
              <div  style={{textAlign:"center", marginTop:'60px' }}>
              <Button type="submit" disabled={isPending}                       variant="outline"
              >
                Add document description
              </Button>
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
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DocumentDescriptionForm;
