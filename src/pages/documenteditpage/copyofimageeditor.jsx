import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const secretKey = import.meta.env.VITE_MY_KEY_FOR_AI;
const samplePrompts = [
  "You are a professional graphic designer. Create the marketing graphics for the following request. Be very professional and do not display text unless specifically asked =>",
  "Design an image showcasing email campaign analytics. Use a sleek and modern style with green and white accents.",
  "Create an image of a modern business dashboard for a marketing CRM with no text above the image. The dashboard should display key performance indicators such as sales growth, customer acquisition, and conversion rates. Use a clean and professional design with a blue and white color scheme.",
  "Generate a professional marketing image for a Sales CRM targeting medium enterprises in finance, featuring a light blue to white background, green and orange accents, dark gray text, a modern office photo with CRM icons and interface screenshots highlighting workflows and lead management, incorporating a sales performance chart, centered company logo with Roboto font.",
];

const ImageEditor = () => {
  const [url, setUrl] = useState("https://pdffornurenai.blob.core.windows.net/pdf/images%20(1).jpeg-1718282669678");
  const [selectedPrompt, setSelectedPrompt] = useState(samplePrompts[0]);
  const [additionalSpecifications, setAdditionalSpecifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullPrompt = `${selectedPrompt}. ${additionalSpecifications}`;
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: fullPrompt,
          n: 1,
          response_format: 'b64_json',
          model: "dall-e-3"
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        }
      );
      const base64Data = response.data.data[0].b64_json;
      setUrl(`data:image/png;base64,${base64Data}`);
    } catch (error) {
      setError("Error generating image. Please try again.");
      console.error("Error generating image:", error);
    }
    setLoading(false);
  };

  const config = {
    files: [
      url
    ],
    resources: [],
    server: {
      version: 1,
      url: "http://localhost:3000/save-image",
      formats: ["png"]
    },
    script: "app.activeDocument.resizeImage(1024,1280);"
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(config));
  const photopeaUrl = `https://www.photopea.com#${encodedConfig}`;

  const simulateKeyPress = (key, ctrlKey = false, altKey = false) => {
    const iframe = iframeRef.current;
    if (iframe) {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const event = new KeyboardEvent('keydown', {
        key,
        ctrlKey,
        altKey,
        bubbles: true,
        cancelable: true,
      });
      iframeDocument.dispatchEvent(event);
    }
  };

  const automateCtrlAltC = () => {
    simulateKeyPress('c', true, true);
  };

  const automateCtrlAltT = () => {
    simulateKeyPress('t', true, true);
  };

  useEffect(() => {
    // Any initial setup or effect to run when component mounts
  }, [photopeaUrl]); // Re-run effect when photopeaUrl changes

  return (
    <div style={{ width: '100vh', height: '100vh' }}>
      <h2>Photopea Integration</h2>
      <select
        value={selectedPrompt}
        onChange={(e) => setSelectedPrompt(e.target.value)}
      >
        {samplePrompts.map((prompt, index) => (
          <option key={index} value={prompt}>
            {prompt}
          </option>
        ))}
      </select>
      <textarea
        value={additionalSpecifications}
        onChange={(e) => setAdditionalSpecifications(e.target.value)}
        placeholder="Additional specifications"
      />
      <button onClick={handleGenerateImage} disabled={loading}>
        {loading ? "Generating Image..." : "Generate Image"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {url && (
        <>
          <button onClick={automateCtrlAltC}>Test Ctrl+Alt+C</button>
          <button onClick={automateCtrlAltT}>Test Ctrl+Alt+T</button>
          <iframe ref={iframeRef} src={photopeaUrl} width="100%" height="600" key={photopeaUrl}></iframe>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
