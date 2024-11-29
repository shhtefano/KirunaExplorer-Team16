import React, { useEffect, useState } from 'react';
import API from '../services/API.js'; // Adjust the import path to where your API is defined
import './AddResources.css'; // Make sure to create this CSS file for styles

const AddResources = () => {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(''); // State for document ID
  const [fileList, setFileList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch the list of files based on documentId when it changes
  useEffect(() => {
    const fetchFiles = async () => {
      if (!documentId) return; // Don't fetch if documentId is not provided

      setLoading(true);
      try {
        const files = await API.listFilesInSupabase(documentId); // Pass the documentId here
        setFileList(files);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [documentId]); // Re-fetch files when documentId changes

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle document ID change
  const handleDocumentIdChange = (e) => {
    setDocumentId(e.target.value);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    if (!documentId) {
      setErrorMessage('Please enter a document ID.');
      return;
    }

    setLoading(true);
    try {
      const fileUrl = await API.uploadFileToSupabase(file, documentId); // Pass the documentId here
      setSuccessMessage(`File uploaded successfully: ${fileUrl}`);
      setErrorMessage('');
      // Fetch updated file list after upload
      const files = await API.listFilesInSupabase(documentId); // Pass the documentId here
      setFileList(files);
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  // Handle file download
  const handleFileDownload = (fileName) => {
    const fileUrl = `https://htbtahvbjarpdpzgzxug.supabase.co/storage/v1/object/public/resources/uploads/resources/${documentId}/${fileName}`;
    
    // Create an anchor element and set the href and download attributes
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; // This sets the name of the file that will be downloaded
    
    // Append the link to the body, trigger click, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <h1>Add Resources</h1>

      <div className="upload-section">
        <h2>Upload a File</h2>
        <input 
          type="text" 
          value={documentId} 
          onChange={handleDocumentIdChange} 
          placeholder="Enter Document ID" 
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      <div className="file-list-section">
        <h2>Uploaded Files</h2>
        {loading ? (
          <p>Loading files...</p>
        ) : (
          <ul>
            {fileList.length > 0 ? (
              fileList.map((fileItem) => (
                <li key={fileItem.name}>
                  {fileItem.name}
                  <button onClick={() => handleFileDownload(fileItem.name)}>Download</button>
                </li>
              ))
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddResources;
