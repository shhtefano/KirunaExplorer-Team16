import { useEffect, useState } from "react";
import { Upload, File, X, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@/components/ui/alert";
import API from "../services/API.js";

const FileUpload = ({ selectedDocument }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchFiles = async () => {
      if (!selectedDocument) return;
      try {
        const files = await API.listFilesInSupabase(
          selectedDocument.document_id
        );
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
    try {
      const fileUrl = await API.downloadFileFromSupabase(
        selectedDocument.document_id,
        fileName
      );
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
    try {
      await API.deleteFileFromSupabase(selectedDocument.document_id, fileName);
      const updatedFiles = await API.listFilesInSupabase(
        selectedDocument.document_id
      );
      setExistingFiles(updatedFiles);
      showToast("File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("Failed to delete file. Please try again.", "error");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      for (const file of files) {
        await API.uploadFileToSupabase(file, selectedDocument.document_id);
      }
      setFiles([]);
      const updatedFiles = await API.listFilesInSupabase(
        selectedDocument.document_id
      );
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
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">
              Drag and drop your files here, or
            </p>
            <div className="flex justify-center items-center space-x-4 mt-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload").click()}
              >
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

          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <File className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            </div>
          )}

          {existingFiles.length > 0 && (
            <>
              <h3 className="text-lg font-medium">Existing Files</h3>
              {existingFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDownload(file.name)}
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileDelete(file.name)}
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
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
