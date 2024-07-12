import React, { useState, useRef, useEffect } from 'react';
import { DndContext, useDraggable, useSensor, useSensors, MouseSensor } from '@dnd-kit/core';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { restrictToParentElement } from '@dnd-kit/modifiers';

function DraggableComponent({ children, id, initialPosition }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        position: 'absolute',
        top: initialPosition.y,
        left: initialPosition.x,
      }
    : {
        position: 'absolute',
        top: initialPosition.y,
        left: initialPosition.x,
      };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

function PdfEditor() {
  const [pdfBytes, setPdfBytes] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSrc, setPdfSrc] = useState('');
  const pdfCanvasContainerRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState('100%');

  useEffect(() => {
    const updateIframeHeight = async () => {
      try {
        if (!pdfBytes) return;

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const page = pdfDoc.getPage(1); // Assuming you want to render the first page

        const viewport = page.getViewport({ scale: 1 });
        const aspectRatio = viewport.width / viewport.height;
        const containerWidth = pdfCanvasContainerRef.current.clientWidth;

        // Calculate the height based on the container width and page aspect ratio
        const height = Math.floor(containerWidth / aspectRatio);
        setIframeHeight(`${height}px`);
      } catch (error) {
        console.error('Error calculating PDF dimensions:', error);
      }
    };

    updateIframeHeight();
  }, [pdfBytes]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setPdfFile(file);

    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      setPdfBytes(typedArray);
      renderPdfToCanvas(typedArray);
      const url = URL.createObjectURL(file);
      setPdfSrc(url);
    };
    reader.readAsArrayBuffer(file);
  };

  const renderPdfToCanvas = async (typedArray) => {
    try {
      const pdfDoc = await PDFDocument.load(typedArray);
      const page = pdfDoc.getPage(1); // Assuming you want to render the first page

      const viewport = page.getViewport({ scale: 1 });
      const canvas = pdfCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering PDF to canvas:', error);
    }
  };

  const addTextElement = () => {
    setTextElements([...textElements, { id: `text-${textElements.length}`, text: 'New Text', x: 0, y: 0 }]);
  };

  const handleDragEnd = (event) => {
    const { id } = event.active;
    const { delta } = event;
    setTextElements((elements) =>
      elements.map((el) =>
        el.id === id
          ? { ...el, x: el.x + delta.x, y: el.y + delta.y }
          : el
      )
    );
  };

  const savePdfWithText = async () => {
    if (!pdfBytes) return;

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    textElements.forEach((el) => {
      firstPage.drawText(el.text, {
        x: el.x -75,
        y: firstPage.getHeight() - el.y-4, // Adjust y to match canvas coordinates
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    });

    const updatedPdfBytes = await pdfDoc.save();
    const blob = new Blob([updatedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the PDF
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated.pdf';
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      <button onClick={addTextElement}>Add Text</button>
      <button onClick={savePdfWithText}>Save PDF</button>
      <div style={{ position: 'relative', border: '1px solid black' , width: '100%', height: '100vh'}} ref={pdfCanvasContainerRef}>
        <canvas ref={pdfCanvasRef} style={{ border: '1px solid black' }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
          }}
        >
          <iframe
            ref={iframeRef}
            src={pdfSrc}
            width="100%"
            height={iframeHeight}
            style={{
            // Ensure mouse events go through iframe to canvas
              border: 'none', // Remove iframe border
            }}
            title="Uploaded PDF"
          ></iframe>
        </div>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          {textElements.map((el) => (
            <DraggableComponent key={el.id} id={el.id} initialPosition={{ x: el.x, y: el.y }}>
              <div
                style={{
                  cursor: 'move',
                  background: 'white',
                  padding: '2px',
                  border: '1px solid black',
                  marginLeft:'342px',
                  marginTop:'58px',
                  marginRight:'360px'
                }}
              >
                {el.text}
              </div>
            </DraggableComponent>
          ))}
        </DndContext>
      </div>
    </div>
  );
}

export default PdfEditor;
