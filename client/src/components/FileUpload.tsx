// FileUploadComponent.tsx
import React, { useState } from 'react';
import { processFile } from '../events/FileProcesser'; // Import the processFile function

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile); // Store the selected file
  };

  // Handle the file processing when user uploads a file
  const handleFileUpload = () => {
    if (file) {
      processFile(file); // Call the function from FileProcessor.ts
    } else {
      console.error('No file selected');
    }
  };



  return (
    <div>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Process File</button>
    </div>
  );
};

export default FileUploadComponent;