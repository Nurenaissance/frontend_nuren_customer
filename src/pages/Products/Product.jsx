import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Link } from "react-router-dom";
import "./product.css";
import axiosInstance from "../../api.jsx";
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';


const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
};

export const Product = () => {
    const tenantId = getTenantIdFromUrl();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({
        active: "",
        owner: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get("/products/");
                setProducts(response.data);
                console.log(products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleClick = () => {
        navigate(`/${tenantId}/productform`);
    };

    const filteredProducts = products.filter(
        (product) =>
          product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.product_code.includes(searchTerm) ||
          (filters.active === "" || product.productActive === (filters.active === "true")) &&
          (filters.owner === "" || product.product_owner.toLowerCase().includes(filters.owner.toLowerCase()))
      );

    const handleImport = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            const importedProducts = JSON.parse(content); // Assuming JSON format for simplicity
            setProducts([...products, ...importedProducts]);
        };

        reader.readAsText(file);
    };

    const handleDownloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(interactions);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "interactions");
        XLSX.writeFile(wb, "interactions.xlsx");
      };
    
      const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.autoTable({
          head: [
            ['Entity ID', 'Type', 'Interaction Type', 'Interaction Datetime', 'Notes']
          ],
          body: filteredInteractions.map(interaction => [
            interaction.entity_id,
            entityTypeNames[interaction.entity_type] || interaction.entity_type,
            interaction.interaction_type,
            interaction.interaction_datetime,
            interaction.notes
          ]),
        });
        doc.save('interactions.pdf');
      };
    

    return (
        <div className="product-page">
            <Sidebar className="product-sidebar" />
            <div className="product-content">
                <div className="product-header">
                    <h1>Products</h1>
                    <div className="product-header-actions">
                        <input
                            type="text"
                            placeholder="Search Products"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="product-search-bar"
                        />
                        <div className="product-import-export-container">
                            
                            <Dropdown>
                          <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-int">
                            Excel File
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <button onClick={handleImport} className="import-excel-btn5">
                              <FaFileExcel/>  Import Excel
                              </button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <button onClick={handleDownloadExcel} className="excel-download-btn1">
                              <FaFileExcel/>  Excel
                              </button>
                            </Dropdown.Item>
                            <Dropdown.Item>
                            <button onClick={handleDownloadPdf} className="pdf-download-btn"><FaFilePdf/>Download PDF</button>
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                            </div>
                        </div>
                            <button className="product-add-product-button" onClick={handleClick}>+ Create Product</button>
                    
                </div>
                <div className="product-filter-container">
                    <select
                        name="active"
                        value={filters.active}
                        onChange={handleFilterChange}
                        className="product-filter-select"
                    >
                        <option value="">All</option>
                        <option value="Yes">Active</option>
                        <option value="No">Inactive</option>
                    </select>
                    <input
                        type="text"
                        name="owner"
                        placeholder="Filter by Owner"
                        value={filters.owner}
                        onChange={handleFilterChange}
                        className="product-filter-input"
                    />
                </div>
                <div className="product-table-container">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Product Code</th>
                                <th>Product Active</th>
                                <th>Product Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                 <tr key={product.id}>
                                  <Link to={`/${tenantId}/productinfo/${product.id}`}>{product.product_name}</Link>
                                 <td>{product.product_code}</td>
                                 <td>{product.productActive ? "Yes" : "No"}</td>
                                 <td>{product.product_owner}</td>
                               </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Product;
