import React from 'react';
import './SearchTable.css';

const SearchTable = ({ data, onClose }) => {
  return (
    <div className="search-popup-container">
      <div className="search-popup-content">
        <button className="search-close-button" onClick={onClose}>Close</button>
        <table>
          <thead>
            <tr>
              {data.length > 0 && Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SearchTable;
