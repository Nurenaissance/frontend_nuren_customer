// src/components/Loader.jsx

import React from 'react';
import './Loader.css';

const Loader = ({ isLoading, children }) => {
  if (!isLoading) return children;

  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader"></div>
      </div>
      {children}
    </div>
  );
};

export default Loader;