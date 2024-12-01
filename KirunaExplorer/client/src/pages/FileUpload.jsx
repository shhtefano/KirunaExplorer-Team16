import { useEffect, useState } from "react";
import { Upload, File, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import API from "../services/API.js";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    // Fetch the list of documents when the component mounts
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    // Fetch files for the selected document
    const fetchFiles = async () => {
      if (!selectedDocument) return;
      try {
        const files = await API.listFilesInSupabase(selectedDocument.document_id);
        setExistingFiles(files);
      } catch (error) {
        console.error("Error fetching files:", error);
        setExistingFiles([]);
      }
    };
    fetchFiles();
  }, [selectedDocument]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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

  // Marking the function as async to use await
  const handleFileDownload = async (fileName) => {
    if (!selectedDocument) {
      alert("Please select a document to download files.");
      return;
    }

    try {
      const fileUrl = await API.downloadFileFromSupabase(selectedDocument.document_id, fileName);
      
      // Create an anchor element and set the href and download attributes
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName; // This sets the name of the file that will be downloaded
      
      // Append the link to the body, trigger click, and then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedDocument) {
      alert("Please select a document before uploading.");
      return;
    }

    setLoading(true);

    try {
      for (const file of files) {
        // Pass document_id to the API
        await API.uploadFileToSupabase(file, selectedDocument.document_id);
      }
      setFiles([]);
      alert("Files uploaded successfully!");
      // Refresh the list of existing files
      const updatedFiles = await API.listFilesInSupabase(selectedDocument.document_id);
      setExistingFiles(updatedFiles);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Original Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
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
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Drag and drop your files here, or</p>
            <div>
              <label htmlFor="file-upload">
                <Button
                  variant="outline"
                  className="mr-2"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  Browse Files
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <File className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            ))}

            <Button
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={files.length === 0 || !selectedDocument || loading}
            >
              {loading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        )}

        {selectedDocument && existingFiles.length > 0 && (
          <div className="space-y-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileDownload(file.name)}
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertDescription>
            Select a document and upload files like maps, text documents, and other resources. These will be associated with the selected document.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
