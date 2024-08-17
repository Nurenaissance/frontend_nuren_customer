import React, { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests

const DocumentRag = () => {
  const [chatMessages, setChatMessages] = useState([]); // State for chat messages
  const [inputMessage, setInputMessage] = useState(''); // State for input message
  const [pdf2File, setPdfFile2] = useState(null); // State for uploaded PDF file
  const [zip2Name, setZipName2] = useState(null); // State for zip file name
  const [prompt, setPrompt] = useState('');
  // Function to handle sending messages
  const handleSendMessage2 = async (message) => {
    try {
      // Update chat messages with the user message
      setChatMessages((prevMessages) => [...prevMessages, { content: message, type: 'user' }]);

      // Send a POST request to the server
      const response = await axios.post('https://nurenai2backend.azurewebsites.net/api/get-pdf/', {
        message: message,
        zipName: zip2Name,
        prompt:prompt, // Send the zipName obtained from file upload
      });

      // Extract the answer from the response data
      const answer = response.data.answer;

      // Update chat messages with the server response
      setChatMessages((prevMessages) => [...prevMessages, { content: answer, type: 'server' }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Function to handle file upload
  const handleFileUpload2 = async (e) => {
    const file = e.target.files[0]; // Get the uploaded file
  
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);
  
      // Send a POST request to upload the file
      const response = await axios.post('https://nurenai2backend.azurewebsites.net/api/upload-pdf/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Set the uploaded PDF file and zip file name
      setPdfFile2(file);
      setZipName2(response.data.zip_file_path);
    } catch (error) {
      console.error('Error uploading and converting PDF:', error);
      console.error('Error details:', error.response); // Log the error details
    }
  };

  return (
    <div style={{ height: '100vh',marginTop:'40px' }}>
      {/* File Upload Section */}
      <div style={{ marginTop: '30px' }}>
        <input type="file" accept=".pdf" onChange={handleFileUpload2} />
        {pdf2File && (
          <div>
            <p>Uploaded PDF: {pdf2File.name}</p>
          
            <embed src={URL.createObjectURL(pdf2File)} type="application/pdf" width="300" height="200" />
          </div>
        )}
      </div>

      {/* Chat Section */}
      <div style={{ marginTop: '20px' }}>
        {/* Display chat messages */}
        {chatMessages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '10px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: message.type === 'user' ? '#3498db' : '#0D1C5D',
              color: '#fff',
            }}
          >
            {message.content}
          </div>
        ))}

        {/* Input field for typing messages */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ marginTop: '10px', padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
        />

        {/* Button to send message */}
        <button
          onClick={() => {
            handleSendMessage2(inputMessage);
            setInputMessage(''); // Clear input after sending message
          }}
          style={{
            marginTop: '10px',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: '#3498db',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DocumentRag;
