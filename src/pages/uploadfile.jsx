import React, { useState } from 'react';
import axios from 'axios';

const UploadToMeta = () => {
  const [file, setFile] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('https://my-template-whatsapp.vercel.app/uploadMedia', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('File uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading file:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h2>Upload to Meta</h2>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <p>File Name: {file.name}</p>
          <p>File Size: {file.size} bytes</p>
          <p>File Type: {file.type}</p>
        </div>
      )}
      <button onClick={handleUpload} disabled={!file}>
        Upload File
      </button>
    </div>
  );
};

export default UploadToMeta;
