import React, { useState } from 'react';
import axios from 'axios';

const UploadToMeta = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileLength, setFileLength] = useState(0); // File size in bytes
  const [fileType, setFileType] = useState('');
  const [uploadSessionId, setUploadSessionId] = useState('');
  const [fileOffset, setFileOffset] = useState(0);
  const [uploadedFileHandle, setUploadedFileHandle] = useState('');

  // Handle file selection and calculate size
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileLength(selectedFile.size); // File size in bytes
      setFileType(selectedFile.type);   // File MIME type
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
      setUploadSessionId(response.data.id);
    } catch (error) {
      console.error('Error starting upload session:', error);
    }
  };
  const handleStartUpload = async () => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/upload:${uploadSessionId}`,
        file, // Send file directly as binary data
        {
          headers: {
            Authorization: 'OAuth EAAVZBobCt7AcBO8trGDsP8t4bTe2mRA7sNdZCQ346G9ZANwsi4CVdKM5MwYwaPlirOHAcpDQ63LoHxPfx81tN9h2SUIHc1LUeEByCzS8eQGH2J7wwe9tqAxZAdwr4SxkXGku2l7imqWY16qemnlOBrjYH3dMjN4gamsTikIROudOL3ScvBzwkuShhth0rR9P',
            file_offset: fileOffset
          }
        }
      );
      setUploadedFileHandle(response.data.h);
    } catch (error) {
      console.error('Error starting upload:', error);
    }
  };

  const handleResumeUpload = async () => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/upload:${uploadSessionId}`,
        {
          headers: {
            Authorization: 'OAuth EAAVZBobCt7AcBO8trGDsP8t4bTe2mRA7sNdZCQ346G9ZANwsi4CVdKM5MwYwaPlirOHAcpDQ63LoHxPfx81tN9h2SUIHc1LUeEByCzS8eQGH2J7wwe9tqAxZAdwr4SxkXGku2l7imqWY16qemnlOBrjYH3dMjN4gamsTikIROudOL3ScvBzwkuShhth0rR9P'
          }
        }
      );
      setFileOffset(response.data.file_offset);
      // Resume the upload using handleStartUpload with updated file_offset
      await handleStartUpload();
    } catch (error) {
      console.error('Error resuming upload:', error);
    }
  };

  return (
    <div>
      <h2>Upload to Meta</h2>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <p>File Name: {fileName}</p>
          <p>File Size: {fileLength} bytes</p>
          <p>File Type: {fileType}</p>
        </div>
      )}
      <button onClick={handleStartUploadSession} disabled={!file}>
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
