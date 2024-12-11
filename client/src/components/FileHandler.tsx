// FileUploadComponent.tsx
import React, { useState } from 'react';
import { processFile, downloadFile } from '../events/FileProcesser'; // Import the processFile function

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile); // Store the selected file
  };

  // Handle the file processing when user uploads a file
  const handleFileUpload = (type: String) => {
    if (file) {
      processFile(file, type); // Call the function from FileProcessor.ts
    } else {
      console.error('No file selected');
    }
  };




  return (
    <div>
      <text>map json upload</text>
      <br></br>
      <input type="file" onChange={handleFileChange} />
      <button onClick={() => handleFileUpload("Map")}>Process File</button>
      <br></br>
      <text>tile upload</text>
      <br></br>
      <input type="file" onChange={handleFileChange} />
      <button onClick={() => handleFileUpload("Tile")}>Process File</button>
      <br></br>
      <text>map json download baby</text>
      <br></br>
      <button onClick={() => downloadFile("Map")}>Download Map</button>
    </div>
    
  );
};

export default FileUploadComponent;