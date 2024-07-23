import React, { useRef } from 'react';


const ImageEditor = () => {
  const iframeRef = useRef(null);
  const runCustomScriptInsta = () => {
    const { current: iframe } = iframeRef;
  
    if (iframe) {
      // Example: Run the first script to open an image
      const openImageScript = 'app.open("https://www.photopea.com/api/img2/pug.png", null, true);';
      iframe.contentWindow.postMessage(openImageScript, '*');
  
      // Wait 2 seconds (2000 ms) and then run the second script
      setTimeout(() => {
        const secondScript = 'app.activeDocument.resizeImage(1080,1600);';
        iframe.contentWindow.postMessage(secondScript, '*');
      }, 2000);
    }
  };
  const runCustomScript = () => {
    const { current: iframe } = iframeRef;
  
    if (iframe) {
      // Example: Run the first script to open an image
      const openImageScript = 'app.open("https://www.photopea.com/api/img2/pug.png", null, true);';
      iframe.contentWindow.postMessage(openImageScript, '*');
  
      // Wait 2 seconds (2000 ms) and then run the second script
      setTimeout(() => {
        const secondScript = 'app.activeDocument.resizeImage(1080,1600);';
        iframe.contentWindow.postMessage(secondScript, '*');
      }, 2000);
    }
  };
  

  const handleIframeLoad = () => {
    const { current: iframe } = iframeRef;

    if (iframe) {
      // Example: Listen to messages from Photopea
      window.addEventListener('message', (e) => {
        console.log('Message received from Photopea:', e.data);
        // Handle messages as needed
      });

      // Example: Send initial script after iframe is loaded (optional)
      // const initialScript = 'app.echoToOE("Hello from React!");';
      // iframe.contentWindow.postMessage(initialScript, '*');
    }
  };

  return (
    <div>
      <h1>Photopea Integration Demo</h1>
      <p>This is a demo of integrating Photopea into a React application.</p>
      <button onClick={runCustomScript}>Run Custom Script</button>
      <button onClick={runCustomScriptInsta}>Run Custom Script</button>
      <button onClick={runCustomScript}>Run Custom Script</button>
      <br />
      <iframe
        title="Photopea"
        ref={iframeRef}
        src="https://www.photopea.com"
        style={{ width: '800px', height: '500px', border: 'none' }}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default ImageEditor;
