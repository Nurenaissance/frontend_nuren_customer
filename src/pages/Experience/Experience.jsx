import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Link } from "react-router-dom";
import "./Experience.css";
import axiosInstance from "../../api.jsx";
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import TopNavbar from "../TopNavbar/TopNavbar.jsx";

const getTenantIdFromUrl = () => {
    const pathArray = window.location.pathname.split('/');
    if (pathArray.length >= 2) {
        return pathArray[1]; // Assumes tenant_id is the first part of the path
    }
    return null; 
};

export const Experience = () => {
    const tenantId = getTenantIdFromUrl();
    const [searchTerm, setSearchTerm] = useState("");
    const [experience, setExperience] = useState([]);
    const [filters, setFilters] = useState({
        active: "",
        owner: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const response = await axiosInstance.get("https://lxx1lctm-8000.inc1.devtunnels.ms/experience/");
                setExperience(response.data);
                console.log(experience);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchExperience();
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredExperiences = experience.filter(
        (experience) =>
          experience.experience_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          experience.vendor_owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (filters.active === "" || experience.isActive === (filters.active === "true")) &&
          (filters.owner === "" || experience.vendor_owner.toLowerCase().includes(filters.owner.toLowerCase()))
      );
      

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleClick = () => {
        navigate(`/${tenantId}/experienceform`);
    };



    const handleImport = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;
            const importedExperience = JSON.parse(content); // Assuming JSON format for simplicity
            setExperience([...experience, ...importedExperience]);
        };

        reader.readAsText(file);
    };

    const handleDownloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(interactions);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "interactions");
        XLSX.writeFile(wb, "experience.xlsx");
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
        <div className="experience-page">
            <Sidebar className="experience-sidebar" />
            <div className="experience-content">
                <div className="experience-header">
                    <h1>Experience</h1>
                    <div className="experience-header-actions">
                        <input
                            type="text"
                            placeholder="Search Experience"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="experience-search-bar"
                        />
                        <div className="experience-import-export-container">
                            <Dropdown>
                                <Dropdown.Toggle variant="primary" id="payments-dropdown6" className="excel-dropdown-int">
                                    Excel File
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item>
                                        <button onClick={handleImport} className="import-excel-btn5">
                                            <FaFileExcel /> Import Excel
                                        </button>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <button onClick={handleDownloadExcel} className="excel-download-btn1">
                                            <FaFileExcel /> Excel
                                        </button>
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <button onClick={handleDownloadPdf} className="pdf-download-btn">
                                            <FaFilePdf /> Download PDF
                                        </button>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                    <button className="experience-add-experience-button" onClick={handleClick}>
                        + Create Experience Model
                    </button>
                </div>
                <div className="experience-filter-container">
                    <select
                        name="active"
                        value={filters.active}
                        onChange={handleFilterChange}
                        className="experience-filter-select"
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
                        className="experience-filter-input"
                    />
                </div>
                <div className="experience-table-container">
                    <table className="experience-table">
                        <thead>
                            <tr>
                                <th>Experience Name</th>
                                <th>Sale Price</th>
                                <th>Slot Timing</th>
                                <th>Vendor Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExperiences.map((experience) => (
                                <tr key={experience.id}>
                                    <td>
                                        <Link to={`/${tenantId}/experienceinfo/${experience.id}`}>
                                            {experience.experience_name}
                                        </Link>
                                    </td>
                                    <td>{experience.sale_price}</td>
                                    <td>{experience.slot_timing}</td>
                                    <td>{experience.vendor_owner}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );    
};

export default Experience;
