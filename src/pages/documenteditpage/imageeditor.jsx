import React, { useRef, useEffect, useState } from 'react';
import 'tui-image-editor/dist/tui-image-editor.css';
import ImageEditor from '@toast-ui/react-image-editor';
import axios from "axios";
import uploadToBlob from "../../azureUpload.jsx";
import './style.css';
import { Sidebar } from '../../components/Sidebar';

const ImgLogo = '../../assets/logo1.png'; // Adjust the path as per your project structure

const myTheme = {
  'common.bi.image': ImgLogo,
  'common.backgroundColor': '#f5f5f5',
  'header.backgroundImage': 'none',
  // Add more customizations as needed
};

const samplePrompts = [
  "Create an image depicting team collaboration for a marketing CRM with no text above the image. Show a group of diverse team members discussing strategies around a table with a whiteboard in the background. Use a professional and dynamic style with warm colors.",
  "Design an image showcasing email campaign analytics   Use a sleek and modern style with green and white accents.",
  "Create an image of a modern business dashboard for a marketing CRM with no text above the image. The dashboard should display key performance indicators such as sales growth, customer acquisition, and conversion rates. Use a clean and professional design with a blue and white color scheme",
  "Generate a professional marketing image for a Sales CRM targeting medium enterprises in finance, featuring a light blue to white background, green and orange accents, dark gray text, a modern office photo with CRM icons and interface screenshots highlighting workflows and lead management, incorporating a sales performance chart, centered company logo with Roboto font",
];

const ImageEditorComponent = () => {
  const editorRef = useRef(null);
  const [prompt, setPrompt] = useState(samplePrompts[0]);
  const [additionalSpecifications, setAdditionalSpecifications] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [variations, setVariations] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(samplePrompts[0]);

  const handleGenerateImage = async () => {
    try {
      const fullPrompt = `${selectedPrompt}. ${additionalSpecifications}`;
      console.log('this is the prompt ',fullPrompt);
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: fullPrompt,
          n: 1,

          model: "dall-e-3"
        },
       
        {
          headers: {
            Authorization: `Bearer `, // Replace with your actual API key
          },
        }
      );

      const generatedImageUrl = response.data.data[0].url;
      setImageURL(generatedImageUrl);
      console.log('Generated image URL:', generatedImageUrl);

      // Download the generated image and upload it to Azure
      const imageResponse = await axios.get(generatedImageUrl, { responseType: 'blob' });
      const uploadedImageUrl = await uploadToBlob(imageResponse.data);
      console.log('Uploaded image URL:', uploadedImageUrl);

    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const loadImageFromURL = (url) => {
    if (url) {
      const editorInstance = editorRef.current.getInstance();
      editorInstance.loadImageFromURL(url, 'GeneratedImage')
        .then((sizeValue) => {
          editorInstance.ui.activeMenuEvent();
          editorInstance.ui.resizeEditor({ imageSize: sizeValue });
          console.log("Image loaded successfully.");
        })
        .catch((err) => {
          console.error("Failed to load image", err);
        });
    }
  };

  const handleGenerateVariations = async () => {
    try {
      // Fetch the image as a blob
      const imageResponse = await axios.get(imageURL, { responseType: 'blob' });

      // Convert the blob to a base64 string
      const reader = new FileReader();
      reader.readAsDataURL(imageResponse.data);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1]; // Get the base64 string without the prefix
        // Send the request to generate variations
        const response = await axios.post(
          "https://api.openai.com/v1/images/variations",
          {
            image: base64data,
            n: 3,
            size: "512x512",
          },
          {
            headers: {
              Authorization: `Bearer `, // Replace with your actual API key
              'Content-Type': 'application/json'
            },
          }
        );

        const variationUrls = response.data.data.map(variation => variation.url);
        setVariations(variationUrls);
        console.log('Generated variations URLs:', variationUrls);
      };
    } catch (error) {
      console.error("Error generating image variations:", error);
    }
  };

  const handleClick = async () => {
    await handleGenerateImage();
  };

  const handleGenerateVariationsClick = async () => {
    await handleGenerateVariations();
  };

  const handleVariationClick = (url) => {
    loadImageFromURL(url);
  };

  

  useEffect(() => {
    if (imageURL) {
      loadImageFromURL(imageURL);
    }
  }, [imageURL]);

  return (
    <div className="editor-container">
      <div className="editor-content">
        <ImageEditor
          ref={editorRef}
          includeUI={{
            theme: myTheme,
            menu: ['shape', 'filter', 'text'],
            initMenu: 'text',
            uiSize: {
              width: '100%',
              height: '100vh',
            },
            menuBarPosition: 'bottom',
          }}
          cssMaxHeight={5000}
          cssMaxWidth={7000}
          selectionStyle={{
            cornerSize: 20,
            rotatingPointOffset: 70,
          }}
          usageStatistics={false}
        />
      </div>
      <div className="prompt-container">
        <div className="prompt-controls">
          <select
            value={selectedPrompt}
            onChange={(e) => {
              setSelectedPrompt(e.target.value);
              setPrompt(e.target.value);
            }}
            className="prompt-select"
          >
            {samplePrompts.map((samplePrompt, index) => (
              <option key={index} value={samplePrompt}>
                {samplePrompt}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Add specifications"
            value={additionalSpecifications}
            onChange={(e) => setAdditionalSpecifications(e.target.value)}
            className="prompt-textarea"
          />
          <div className="button-group">
            <button onClick={handleClick} className="generate-button">
              Generate Image
            </button>
            <button onClick={handleGenerateVariationsClick} className="generate-variations-button">
              Generate Variations
            </button>
          </div>
        </div>
        <div className="variations-container">
          {variations.map((variationUrl, index) => (
            <img
              key={index}
              src={variationUrl}
              alt={`Variation ${index}`}
              className="variation-image"
              onClick={() => handleVariationClick(variationUrl)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageEditorComponent;
