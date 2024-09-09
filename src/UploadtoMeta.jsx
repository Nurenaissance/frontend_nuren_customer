import React, { useState } from 'react';
import axios from 'axios';

const UploadToMeta = ({ accessToken, businessPhoneNumberId, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileLength, setFileLength] = useState(0);
  const [fileType, setFileType] = useState('');
  const [uploadSessionId, setUploadSessionId] = useState('');
  const [fileOffset, setFileOffset] = useState(0);
  const [uploadedFileHandle, setUploadedFileHandle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileLength(selectedFile.size);
      setFileType(selectedFile.type);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleStartUploadSession = async () => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${businessPhoneNumberId}/uploads`,
        {
          file_name: fileName,
          file_length: fileLength,
          file_type: fileType
        },
        {
          params: {
            access_token: accessToken
          }
        }
      );
      setUploadSessionId(response.data.id);
    } catch (error) {
      console.error('Error starting upload session:', error);
      throw error;
    }
  };

  const handleStartUpload = async () => {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/upload:${uploadSessionId}`,
        file,
        {
          headers: {
            Authorization: `OAuth ${accessToken}`,
            file_offset: fileOffset
          }
        }
      );
      setUploadedFileHandle(response.data.h);
      onUploadComplete({
        handle: response.data.h,
        fileName,
        fileType,
        previewUrl
      });
    } catch (error) {
      console.error('Error starting upload:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }
    try {
      await handleStartUploadSession();
      await handleStartUpload();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload}>Upload to Meta</button>
      {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
    </div>
  );
};

export default UploadToMeta;