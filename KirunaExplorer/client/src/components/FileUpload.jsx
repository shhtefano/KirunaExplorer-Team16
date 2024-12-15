import { useEffect, useState } from "react";
import { Upload, File, X, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Snackbar from "@mui/material/Snackbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import API from "../services/API.js";


const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
        showToast("Failed to fetch documents.", "error");
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!selectedDocument) return;
      try {
        const files = await API.listFilesInSupabase(selectedDocument.document_id);
        setExistingFiles(files);
      } catch (error) {
        console.error("Error fetching files:", error);
        setExistingFiles([]);
        showToast("Failed to fetch existing files.", "error");
      }
    };
    fetchFiles();
  }, [selectedDocument]);

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleFileDownload = async (fileName) => {
    if (!selectedDocument) {
      showToast("Please select a document to download files.", "error");
      return;
    }

    try {
      const fileUrl = await API.downloadFileFromSupabase(selectedDocument.document_id, fileName);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("File downloaded successfully.");
    } catch (error) {
      console.error("Error downloading file:", error);
      showToast("Failed to download file. Please try again.", "error");
    }
  };

  const handleFileDelete = async (fileName) => {
    if (!selectedDocument) {
      showToast("Please select a document to delete files.", "error");
      return;
    }

    try {
      await API.deleteFileFromSupabase(selectedDocument.document_id, fileName);
      const updatedFiles = await API.listFilesInSupabase(selectedDocument.document_id);
      setExistingFiles(updatedFiles);
      showToast("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Failed to delete file. Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    if (!selectedDocument) {
      showToast("Please select a document before uploading.", "error");
      return;
    }

    setLoading(true);

    try {
      for (const file of files) {
        await API.uploadFileToSupabase(file, selectedDocument.document_id);
      }
      setFiles([]);
      const updatedFiles = await API.listFilesInSupabase(selectedDocument.document_id);
      setExistingFiles(updatedFiles);
      showToast("Files uploaded successfully.");
    } catch (error) {
      console.error("Error uploading files:", error);
      showToast("Failed to upload files. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto mt-4">
        <CardHeader>
          <CardTitle>Upload Original Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) =>
              setSelectedDocument(documents.find((doc) => doc.document_id === Number(value)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.document_id} value={doc.document_id.toString()}>
                  {doc.document_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">Drag and drop your files here, or</p>
            <div className="flex justify-center items-center space-x-4 mt-2">
              <Button variant="outline" onClick={() => document.getElementById("file-upload").click()}>
                Browse Files
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          {/* File preview section */}
          <div className="mt-4">
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center">
                    <File className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name} ({file.type})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button onClick={handleSubmit} disabled={loading || files.length === 0}>
              {loading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>

          {selectedDocument && existingFiles.length > 0 && (
            <>
              <h3 className="text-lg font-medium">Existing Files</h3>
              {existingFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleFileDownload(file.name)}>
                      <Download className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleFileDelete(file.name)}>
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
          <Alert>
            <AlertDescription>
              Select a document and upload files like maps, text documents, and other resources. These will be associated with the selected document.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} 
      >
        <Alert severity={toast.severity} onClose={handleCloseToast}  sx={{ width: "70%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUpload;
