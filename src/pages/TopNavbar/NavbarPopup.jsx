import React from 'react';
import './NavbarPopup.css';

const NavbarPopup = ({ data, onClose }) => {
  return (
    <div className="navbar-popup-overlay">
      <div className="navbar-popup-content">
        <button className="navbar-popup-close" onClick={onClose}>×</button>
        <h2 className="navbar-popup-title">Search Results</h2>
        {data.length > 0 ? (
          <div className="navbar-popup-table">
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="navbar-popup-no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default NavbarPopup;