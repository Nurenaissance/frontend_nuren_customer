import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './BulkImport.css';
import { Sidebar } from "../../components/Sidebar";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import { FiFile, FiDatabase } from 'react-icons/fi';
import * as XLSX from "xlsx"; 
import axiosInstance from '../../api.jsx';

const BulkImport = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [modelName, setModelName] = useState('');
  const [columns, setColumns] = useState([]);
  const [startrow, setStartRow] = useState(0);
  const [columnMappings, setColumnMappings] = useState({});
  const [requiredColumns, setRequiredColumns] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const fileInputRef = useRef(null);
  const validModelNames = ["Lead", "Contact", "Account", "calls", "meetings", "Opportunity"];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modelNameParam = urlParams.get('model');
    if (modelNameParam && validModelNames.includes(modelNameParam)) {
      setModelName(modelNameParam);
    }
  }, []);

  const handlebrowseExcelFile = () =>{
    fileInputRef.current.click();
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    console.log(excelFile);
    setColumns([]);
    setSelectedValues({});
  };

  useEffect(() => {
    console.log(excelFile);
}, [excelFile]);

  const handleUploadExcel = async () => {
    try {
      const formData = new FormData();
      formData.append('model_name', modelName); 
      formData.append('file', excelFile); 
      formData.append('column_mappings_json', JSON.stringify(columnMappings));
      formData.append('model_name', "Account");

      const response = await axios.post('https://webappbaackend.azurewebsites.net/uploadexcel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Tenant-ID': "ll"
        },
      });

      console.log('Excel uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading Excel:', error);
    }
  };

 

  const getExcelColumnNames = () => {
    if (excelFile) {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('startrow', startrow);
      console.log("file",excelFile);

      axios.post('https://webappbaackend.azurewebsites.net/excel-column/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Tenant-ID': "ll" // Custom header for tenant ID
      }
    })
      .then((response) => {
        const columnNames = response.data.columns.map(column => {
          if (typeof column === 'string') {
            return column;
          } else {
            return ''; // or any default value
          }
        });
        setColumns(columnNames);
        initializeColumnMappings(columnNames);
      })
      .catch((error) => {
        console.error('Error retrieving column names:', error);
      });
    }
  };

  const initializeColumnMappings = (columns) => {
    const mappings = {};
    const requiredCols = [];

    columns.forEach((column) => {
      const lowercaseColumn = column.toLowerCase();
      if (validColumn(lowercaseColumn)) {
        const columnName = getColumnMapping(lowercaseColumn);
        requiredCols.push(columnName);
        mappings[columnName] = '';
      }
    });
    setColumnMappings(mappings);
    setRequiredColumns(requiredCols);
  };

  const validColumn = (column) => {
    return column.includes('first_name') || 
           column.includes('last_name') || 
           column.includes('email') ||
           column.includes('phone') ||
           column.includes('createdby');
  };

  const getColumnMapping = (column) => {
    switch (column) {
      case 'first_name':
      case 'last_name':
      case 'email':
      case 'phone':
      case 'createdby':
        return column;
      default:
        return '';
    }
  };

  const handleEntityChange = (e, column) => {
    const { value } = e.target;
    setSelectedValues(prevState => ({
      ...prevState,
      [column]: value
    }));
    setColumnMappings(prevMappings => ({
      ...prevMappings,
      [column]: value
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      setExcelFile(files[0]);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  
  

  return(
  <div className="bulk-importing">
    <TopNavbar />
    <div className="sidebar-container">
      <Sidebar />
      <div className="content">
        <div className="bulk-import-heading">
          <h1>Import</h1>
        </div>
        <div className="bulk-boxes-container">
            <div className="bulk-box">
              <h2><FiFile /> From File</h2>
              <div className="bulk-upload-container" onDrop={handleDrop} onDragOver={handleDragOver}>
                <p>Drag and drop your file here</p>
                <p>or</p>
                <input type='file' accept='.xlsx,.xls' onChange={handleFileChange} />
      <p>Download sample file CSV or XLSX</p>
      {excelFile && (
                  <button className="uploadexcel2" onClick={handleUploadExcel}>Upload Excel</button>
                )}
                <div className='get'>
        <button className='getcolumn' onClick={getExcelColumnNames}>Get Columns</button>
      </div>
      {columns.length > 0 && (
        <div className='Entities'>
          <p>Map Columns to Entities:</p>
          <ul>
            {columns.map((column, index) => (
              <li key={index}>
                {column}
                <select className='selectImport'value={selectedValues[column] || ''} onChange={(e) => handleEntityChange(e, column)}>
                  <option value=''> Select Entity</option>
                  <option value='Name'>First Name</option>
                  <option value='last_name'>Last Name</option>
                  <option value='email'>Email</option>
                  <option value='phone'>Phone</option>
                  <option value='created_by'>Created By</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
      {requiredColumns.length > 0 && (
        <div>
          <p>Required Columns for Creating Contacts:</p>
          <ul className='creatingcontact'>
            {requiredColumns.map((column, index) => (
              <li className="creatingcontactList"key={index}>{column}</li>
            ))}
          </ul>
        </div>
      )}
              </div>
            </div>
            <div className="or-divider">OR</div>
            <div className="bulk-box">
            <h2><FiDatabase /> From Other CRM's</h2>
            <div className="bulk-upload-container">
              <p>Which CRM are you coming from?</p>
              <p>or</p>
              <select>
                <option>Select the CRM</option>
                <option>CRM Option 1</option>
                <option>CRM Option 2</option>
                <option>CRM Option 3</option>
                {/* Add more options as needed */}
              </select>
              <p>Choose a CRM from which you would like to import. Importing data from other CRMs is made easy. It is just a click away.</p>
              </div>
            </div>
            </div>
            <div className="bulk-buttons-container">
            <button className="bulk-cancel-button">Cancel</button>
            <button className="bulk-save-button">Save and Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;