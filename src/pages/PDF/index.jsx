import React, { useState, useRef } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import './pdf.css';
import { Link } from "react-router-dom";
import Draggable from 'react-draggable';

import TopNavbar from '../TopNavbar/TopNavbar.jsx';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import TextsmsRoundedIcon from '@mui/icons-material/TextsmsRounded';
import HealingRoundedIcon from '@mui/icons-material/HealingRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PublishedWithChangesRoundedIcon from '@mui/icons-material/PublishedWithChangesRounded';

// Set the workerSrc globally
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
      return pathArray[1];
  }
  return null;
};

const PdfUploader = () => {
  const tenantId = getTenantIdFromUrl();
  const [pdfFile, setPdfFile] = useState(null);
  const [modifiedPdfUrl, setModifiedPdfUrl] = useState(null);
  const [textToAdd, setTextToAdd] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 500 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false); // State to track image upload visibility
  const [showTextOptions, setShowTextOptions] = useState(false); // State to track text options visibility
  const [convertedImages, setConvertedImages] = useState([]);
  

  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);


  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const fileType = file.type;
      if (fileType === "application/pdf") {
        setPdfFile(file);
        setImageFile(null); // Reset image file if PDF is selected
      } else if (fileType === "image/jpeg" || fileType === "image/png") {
        setImageFile(file);
        setPdfFile(null); // Reset PDF file if image is selected
      } else {
        alert("Unsupported file format. Please upload a PDF, JPEG, or PNG file.");
      }
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const initialText = "";
      const initialTextSize = 20;
      firstPage.drawText(initialText, {
        x: textPosition.x,
        y: textPosition.y,
        size: initialTextSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setModifiedPdfUrl(url);
    } catch (error) {
      console.error("Error modifying PDF:", error);
      alert("An error occurred while modifying the PDF.");
    }
  };

  const handleAddText = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }
  
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
  
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber];
  
      // Get page dimensions
      const { width, height } = page.getSize();
  
      // Calculate text position based on dragged coordinates
      const x = textPosition.x * width / 100; // Assuming textPosition.x is a percentage of width
      const y = (height - textPosition.y) * height / 100; // Assuming textPosition.y is a percentage of height
  
      // Draw the text on the page
      page.drawText(textToAdd, {
        x,
        y,
        size: 20,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
  
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
  
      // Update the modifiedPdfUrl state with the new URL
      setModifiedPdfUrl(url);
  
      setShowTextOptions(false); // Hide text options after adding text
    } catch (error) {
      console.error("Error adding text to PDF:", error);
      alert("An error occurred while adding text to the PDF.");
    }
  };
  
  
  
  
  const handleDraw = () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }
  
    setIsDrawing(true);
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
  
    const onMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
  
      ctx.lineTo(x, y);
      ctx.stroke();
    };
  
    const onMouseDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
  
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
  
      ctx.moveTo(x, y);
  
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseup", onMouseUp);
    };
  
    const onMouseUp = () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };
  
    canvas.addEventListener("mousedown", onMouseDown);
  };
  
  const handleSaveDrawing = async () => {
    if (!canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
  
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber];
  
      const imgData = canvas.toDataURL("image/png");
      const image = await pdfDoc.embedPng(imgData);
  
      // Get page dimensions
      const { width, height } = page.getSize();
  
      // Draw the image on the page
      page.drawImage(image, {
        x: 0,
        y: height - canvas.height, // Adjust y position based on canvas height
        width: canvas.width,
        height: canvas.height,
      });
  
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setModifiedPdfUrl(url);
  
      setIsDrawing(false); // Reset drawing state
    } catch (error) {
      console.error("Error saving drawing to PDF:", error);
      alert("An error occurred while saving drawing to the PDF.");
    }
  };
  

  const handleTextChange = (event) => {
    setTextToAdd(event.target.value);
  };

  const updateTextPosition = (x, y) => {
    setTextPosition({ x, y });
  };

  const onPageChange = (event) => {
    setPageNumber(Number(event.target.value));
  };

  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const handleAttachImage = () => {
    setShowImageUpload(true); // Show image upload section
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert("Please upload an image file first.");
      return;
    }

    try {
      const pdfArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);

      const pages = pdfDoc.getPages();
      const page = pages[pageNumber];

      const imageArrayBuffer = await imageFile.arrayBuffer();

      let image;
      if (imageFile.type === "image/png") {
        image = await pdfDoc.embedPng(new Uint8Array(imageArrayBuffer));
      } else if (imageFile.type === "image/jpeg") {
        image = await pdfDoc.embedJpg(new Uint8Array(imageArrayBuffer));
      } else {
        alert("Unsupported image format. Please upload a PNG or JPEG image.");
        return;
      }

      const { width, height } = image.scale(0.5);

      page.drawImage(image, {
        x: textPosition.x,
        y: textPosition.y,
        width,
        height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setModifiedPdfUrl(url);

      // Reset states
      setShowImageUpload(false);
      setImageFile(null);
    } catch (error) {
      console.error("Error attaching image to PDF:", error);
      alert("An error occurred while attaching the image to the PDF.");
    }
  };

  const onMouseDown = (event) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    ctx.moveTo(x, y);

    const onMouseMove = (event) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
    
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

       // Update the text position state while dragging
  updateTextPosition(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onMouseUp = () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
  };


  const handleAddPage = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      pdfDoc.addPage();

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setModifiedPdfUrl(url);
    } catch (error) {
      console.error("Error adding page to PDF:", error);
      alert("An error occurred while adding a page to the PDF.");
    }
  };

  const convertPdfToImages = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file first.");
      return;
    }

    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await getDocument({ data: pdfArrayBuffer }).promise;
    const numPages = pdf.numPages;
    const images = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      images.push(canvas.toDataURL());
    }

    setConvertedImages(images);
  };

  const convertImageToPdf = async () => {
    if (!imageFile) {
      alert("Please upload an image file first.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const imageArrayBuffer = await imageFile.arrayBuffer();

    let image;
    if (imageFile.type === "image/png") {
      image = await pdfDoc.embedPng(new Uint8Array(imageArrayBuffer));
    } else if (imageFile.type === "image/jpeg") {
      image = await pdfDoc.embedJpg(new Uint8Array(imageArrayBuffer));
    } else {
      alert("Unsupported image format. Please upload a PNG or JPEG image.");
      return;
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `converted_${imageFile.name.replace(/\.[^/.]+$/, ".pdf")}`);
  };

  const handleCancel = () => {
    // Reset all states or perform any necessary clean-up operations here
    setPdfFile(null);
    setModifiedPdfUrl(null);
    setTextToAdd("");
    setTextPosition({ x: 50, y: 500 });
    setIsDrawing(false);
    setImageFile(null);
    setShowImageUpload(false);
    setShowTextOptions(false);
    setConvertedImages([]);
  };

  return (
    <div className='edit-docspage'>
   <div className='side-editdocs'>
                <Link to={`/${tenantId}/home`} id='back-inter-task' className='back-button-edit'>
                    Back
                </Link>
            </div>

<div className='main-content'>
<div className="editdocs-nav">
          <TopNavbar />
        </div>

       <div className="btn-docs">
       <div>
        <h1 className='editdocs-heading'>Edit Documents</h1>
        </div>
        <div>
        <button onClick={handleCancel} className="action-buttons-modify">Cancel</button> {/* Added Cancel button */}
        <button onClick={handlePdfUpload} className="action-buttons-modify">Modified</button>
        <button onClick={handleSaveDrawing} className="save-button-docs">Save Drawing</button>
        <button onClick={handleAddText} className="save-text-button">Save Text</button>


        </div>
       </div>
     
       <div >
    
     
      <div className='action-buttons'>
        <div className='action-buttons-1'>
        <button onClick={() => setShowTextOptions(true)} className='action-btn1'>  <EditRoundedIcon/>Add Text</button>
        <button onClick={handleDraw} className='action-btn2'><BorderColorRoundedIcon/>Draw</button>
        <button onClick={handleAddPage} className='action-btn3'><TextsmsRoundedIcon/>Add Page</button>
        </div>
        <div className='action-buttons-1'>
        <button onClick={handleAttachImage}  className='action-btn4'><HealingRoundedIcon/>Attach Image</button>
        <button onClick={convertPdfToImages} className='action-btn5'><PublishedWithChangesRoundedIcon/>Convert PDF to Images</button>
        <button onClick={convertImageToPdf}  className='action-btn6'><PublishedWithChangesRoundedIcon/>Convert Image to PDF</button>
        </div>
       
       
      </div>

      {showTextOptions && (
  <div className="text-options">
    <textarea
      placeholder="Enter text"
      value={textToAdd}
      onChange={handleTextChange}
    />
    <Draggable
      onStop={(e, data) => {
        // Update the position of textRef
        textRef.current.style.left = `${data.x}px`;
        textRef.current.style.top = `${data.y}px`;
      }}
    >
      <div
        ref={textRef}
        style={{
          position: "absolute",
          cursor: "move",
        }}
      >
        {textToAdd}
      </div>
    </Draggable>
    <button onClick={handleAddText} className="save-text-button">
      <PublishedWithChangesRoundedIcon />
      Save Text
    </button>
  </div>
)}


      <div className="upload-pdf-box">
        <div className="upload-pdf-box1">
          <h1 className='upload-file-head'>Upload Files</h1>
         
        <div className="upload-section">
       <div className='pdf-icon'>
       <FileUploadRoundedIcon style={{width:'40px',height:'40px'}}/>
       </div>
        <label htmlFor="file-upload" className="upload-label">
       
          <input
            id="file-upload"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
          />
          <span>Upload PDF/Image</span>
        </label>
      </div>
        </div>
      
      </div>

    

    

      {isDrawing && (
              <div className="drawing-container">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={600}
                  className='draw-pdf'
                  style={{ border: "1px solid black" }}
                  onMouseDown={onMouseDown}
                ></canvas>
                <button onClick={handleSaveDrawing} className="save-drawing-button">
                  <PublishedWithChangesRoundedIcon />
                  Save Drawing
                </button>
              </div>
            )}


{showImageUpload && (
              <div className="image-upload">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <Draggable onStop={(e, data) => updateTextPosition(data.x, data.y)}>
                  <div
                    ref={imageRef}
                    style={{
                      position: "absolute",
                      left: textPosition.x,
                      top: textPosition.y,
                      cursor: "move",
                    }}
                  >
                    {imageFile && (
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Uploaded"
                        style={{ maxWidth: "200px", maxHeight: "200px" }}
                      />
                    )}
                  </div>
                </Draggable>
                <button onClick={handleImageUpload} className="save-image-button">
                  <PublishedWithChangesRoundedIcon />
                  Save Image
                </button>
              </div>
            )}

      {modifiedPdfUrl && (
        <div className="pdf-preview">
          <iframe src={modifiedPdfUrl} width="800" height="800"></iframe>
          <a href={modifiedPdfUrl} download={`modified_${pdfFile.name}`} className="download-button-docs">Download </a>

        </div>

      )}

      {convertedImages.length > 0 && (
        <div className="image-preview">
          {convertedImages.map((src, index) => (
            <img key={index} src={src} alt={`Page ${index + 1}`} width="600" />
          ))}
        </div>
      )}

    </div>
</div>
    </div>
   
   
  );
};

export default PdfUploader;
