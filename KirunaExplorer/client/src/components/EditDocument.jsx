import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

export default EditDocument;
