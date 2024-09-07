import React, { useState } from 'react';
import axios from 'axios';

const UploadToMeta = () => {
  const [fileBinary, setFileBinary] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileLength, setFileLength] = useState(0);
  const [fileType, setFileType] = useState("");
  const [uploadSessionId, setUploadSessionId] = useState("");
  const [fileOffset, setFileOffset] = useState(0);
  const [uploadedFileHandle, setUploadedFileHandle] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setFileBinary(e.target.result); // Save binary data (ArrayBuffer)
        setFileName(selectedFile.name);
        setFileLength(selectedFile.size); // File size in bytes
        setFileType(selectedFile.type);   // File MIME type
      };

      reader.readAsArrayBuffer(selectedFile);  // Read file as binary
    }
  };

  const handleStartUploadSession = async () => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/1546607802575879/uploads`,
        {
          file_name: fileName,
          file_length: fileLength,
          file_type: fileType
        },
        {
          params: {
            access_token: 'EAAVZBobCt7AcBO8trGDsP8t4bTe2mRA7sNdZCQ346G9ZANwsi4CVdKM5MwYwaPlirOHAcpDQ63LoHxPfx81tN9h2SUIHc1LUeEByCzS8eQGH2J7wwe9tqAxZAdwr4SxkXGku2l7imqWY16qemnlOBrjYH3dMjN4gamsTikIROudOL3ScvBzwkuShhth0rR9P'
          }
        }
      );

      const uploadSessionId = response.data.id;
      setUploadSessionId(uploadSessionId);
      console.log('Upload session started:', uploadSessionId);
    } catch (error) {
      console.error('Error starting upload session:', error.response ? error.response.data : error.message);
    }
  };

  const handleStartUpload = async () => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${uploadSessionId}`,
        fileBinary, // Sending the file directly as binary data (ArrayBuffer)
        {
          headers: {
            Authorization: 'OAuth EAAVZBobCt7AcBO8trGDsP8t4bTe2mRA7sNdZCQ346G9ZANwsi4CVdKM5MwYwaPlirOHAcpDQ63LoHxPfx81tN9h2SUIHc1LUeEByCzS8eQGH2J7wwe9tqAxZAdwr4SxkXGku2l7imqWY16qemnlOBrjYH3dMjN4gamsTikIROudOL3ScvBzwkuShhth0rR9P',
            'Content-Type': 'application/octet-stream', // Set content type to binary
            'file_offset': fileOffset.toString(),
          }
        }
      );

      if (response.data.h) {
        console.log('Upload successful:', response.data);
        setUploadedFileHandle(response.data.h);
      } else {
        console.error('Upload failed:', response.data);
      }
    } catch (error) {
      console.error('Error during upload:', error.response ? error.response.data : error.message);
    }
  };

  const handleResumeUpload = async () => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/upload:${uploadSessionId}`,
        {
          headers: {
            Authorization: 'OAuth YOUR_ACCESS_TOKEN'
          }
        }
      );
      setFileOffset(response.data.file_offset);
      console.log('Resuming upload from offset:', response.data.file_offset);
      // Resume the upload using handleStartUpload with updated file_offset
      await handleStartUpload();
    } catch (error) {
      console.error('Error resuming upload:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <h2>Upload to Meta</h2>
      <input type="file" onChange={handleFileChange} />
      {fileName && (
        <div>
          <p>File Name: {fileName}</p>
          <p>File Size: {fileLength} bytes</p>
          <p>File Type: {fileType}</p>
        </div>
      )}
      <button onClick={handleStartUploadSession} disabled={!fileBinary}>
        Start Upload Session
      </button>
      {uploadSessionId && (
        <button onClick={handleStartUpload}>Start Upload</button>
      )}
      {fileOffset > 0 && (
        <button onClick={handleResumeUpload}>Resume Upload</button>
      )}
      {uploadedFileHandle && (
        <p>File successfully uploaded with handle: {uploadedFileHandle}</p>
      )}
    </div>
  );
};

export default UploadToMeta;
