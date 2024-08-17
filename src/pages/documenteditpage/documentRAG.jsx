import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaRedo } from 'react-icons/fa';
import './DocumentRag.css';

const DocumentRag = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [zipName, setZipName] = useState(null);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef(null);

  const handleSendMessage = async (message) => {
    try {
      setChatMessages((prevMessages) => [...prevMessages, { content: message, type: 'user' }]);

      const response = await axios.post('https://hx587qc4-8000.inc1.devtunnels.ms/api/get-pdf/', {
        message: message,
        zipName: zipName,
        prompt: prompt,
      });

      const answer = response.data.answer;

      setChatMessages((prevMessages) => [...prevMessages, { content: answer, type: 'server' }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
  
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
    
        const response = await axios.post('https://hx587qc4-8000.inc1.devtunnels.ms/api/upload-pdf/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
    
        setPdfFile(file);
        setZipName(response.data.zip_file_path);
      } catch (error) {
        console.error('Error uploading and converting PDF:', error);
        console.error('Error details:', error.response);
      }
    }
  };

  const handleReupload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="doc-rag__container">
      <h1 className="doc-rag__title">Interactive Document Chat</h1>
      <div className="doc-rag__content">
        <div className="doc-rag__pdf-section">
          {pdfFile ? (
            <embed src={URL.createObjectURL(pdfFile)} type="application/pdf" width="100%" height="100%" />
          ) : (
            <div className="doc-rag__pdf-placeholder">
              <FaUpload size={48} />
              <p>Upload a PDF to preview here</p>
            </div>
          )}
        </div>
        <div className="doc-rag__interaction-section">
          <div className="doc-rag__upload-section">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              className="doc-rag__file-input" 
              ref={fileInputRef}
              style={{display:'none'}}
            />
            {!pdfFile ? (
              <button className="doc-rag__upload-button" onClick={() => fileInputRef.current.click()}>
                <FaUpload /> Upload PDF
              </button>
            ) : (
              <button className="doc-rag__reupload-button" onClick={handleReupload}>
                <FaRedo /> Reupload
              </button>
            )}
            {pdfFile && <p className="doc-rag__file-name">Uploaded: {pdfFile.name}</p>}
          </div>

          <div className="doc-rag__chat-section">
            <div className="doc-rag__messages">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`doc-rag__message ${message.type === 'user' ? 'doc-rag__message--user' : 'doc-rag__message--server'}`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <div className="doc-rag__input-area">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="doc-rag__message-input"
              />

              <button
                onClick={() => {
                  if (inputMessage.trim()) {
                    handleSendMessage(inputMessage);
                    setInputMessage('');
                  }
                }}
                className="doc-rag__send-button"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentRag;