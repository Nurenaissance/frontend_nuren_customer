import { NavLink, useNavigate } from "react-router-dom";
import "./register.css";
import Spline from "@splinetool/react-spline";
import { useState, useEffect } from "react";
import registration from "../../assets/registration.jpg"
import logo from "../../assets/logo.png"
import { 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Typography,
  Container,
  Box
} from "@mui/material";


const PopupCard = ({ message, onClose }) => {
  return (
    <div className="popup-card-overlay">
      <div className="popup-card">
        <h2>{message}</h2>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [organisations, setOrganisations] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [newOrganisationName, setNewOrganisationName] = useState("");
  const [newOrganisationTenantId, setNewOrganisationTenantId] = useState("");
  const [newOrganisationPassword, setNewOrganisationPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({}); 

  useEffect(() => {
    // Fetch organisation names from the backend when component mounts
    fetch(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/createTenant`)
      .then((res) => res.json())
      .then((data) => {
        // Extract organisation names from the response
        const orgNames = data.map((org) => ({
          id: org.id,
          name: org.organization,
          tenantId: org.id,
        }));
        console.log(orgNames);
        setOrganisations(orgNames);
      })
      .catch((error) => console.error("Error fetching organisations:", error));
  }, []);


  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!role) newErrors.role = "Role is required";
    if (!organisation) newErrors.organisation = "Organisation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   const authRegister = async() => {
    event.preventDefault(); 
   // if (!validateForm()) return;
    setIsSubmitting(true);
    // Find the tenant ID associated with the selected organisation
    const selectedOrg = organisations.find((org) => org.name === organisation);
    const selectedTenantId = selectedOrg ? selectedOrg.tenantId : "";

    try {
      const response = await fetch(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID":3,
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          role: role,
          organization: organisation,
          tenant: selectedTenantId, // Pass the tenant ID here
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setShowPopup(true);
  
      
        // Perform navigation only if registration is successful
        navigate(`/login`); // Navigate to login page after successful registration
      
    } catch (error) {
      console.error("Registration failed:", error);
    }
    finally {
      setIsSubmitting(false); // End loading
    }
  };

  const handlePopupSubmit = () => {
    // Handle submission of the new organisation popup form
    // Implement logic to create the new organisation
    fetch(`https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/createTenant/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenant_id: newOrganisationTenantId,
        organization: newOrganisationName,
        password: newOrganisationPassword,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Update organisations state with the new organisation name
        setOrganisations([...organisations, { name: newOrganisationName }]);
        // Clear the new organisation form fields
        setNewOrganisationName("");
        setNewOrganisationTenantId("");
        setNewOrganisationPassword("");
        // Close the popup
        setShowNewOrgForm(false);
        alert("New organisation created successfully!");
      })
      .catch((error) =>
        console.error("Error creating new organisation:", error)
      );
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate(`/login`);
  };

  return (
    <div className="auth">
  <div className="auth_wrapper">
    <div className="form_container">
    <div className="navbar2">
      <div className="nav-logo-container">
        <img src={logo} alt="Logo" className="nav-logo" />
        <span className="nav-logo-title">Nuren AI</span>
      </div>
      </div>
      <div className="auth_inner">
        <h2 className="auth_paragraph">Register</h2>
        <form className="auth_form" onSubmit={authRegister}>
          <label htmlFor="username" className="auth_label">
            <input
              className="auth_input"
              type="text"
              placeholder="👤 Username"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label htmlFor="email" className="auth_label">
            <input
              className="auth_input"
              type="email"
              placeholder="✉️ Email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label htmlFor="password" className="auth_label">
            <input
              className="auth_input"
              type="password"
              placeholder="🔑 Password"
              id="pasword"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label htmlFor="role" className="auth_label">
            <select
              className="auth_input"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <label htmlFor="organisation" className="auth_label">
            <select
              className="auth_input"
              id="organisation"
              value={organisation}
              onChange={(e) => {
                setOrganisation(e.target.value);
                if (e.target.value === "createNew") {
                  setShowNewOrgForm(true);
                } else {
                  setShowNewOrgForm(false);
                }
              }}
            >
              <option value="">Select Organisation</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
              <option value="createNew">Create New Organization</option>
            </select>
          </label>
          
          <NavLink className="auth_login" to="/login">
            login?
          </NavLink>

          <button className="auth_btn" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
    
<img style={{height:'90%'}} src={registration} alt="" />
  </div>

  {showNewOrgForm && (
    <div className="new-org-form-overlay">
      <div className="new-org-form">
        <button className="close-btn" onClick={() => setShowNewOrgForm(false)}>
          &#10006;
        </button>
        <label htmlFor="newOrganisationName" className="auth_label">
          New Organisation Name:
          <input
            className="auth_input"
            type="text"
            placeholder="New Organisation Name"
            id="newOrganisationName"
            required
            value={newOrganisationName}
            onChange={(e) => setNewOrganisationName(e.target.value)}
          />
        </label>
        <label htmlFor="newOrganisationTenantId" className="auth_label">
          Tenant ID:
          <input
            className="auth_input"
            type="text"
            placeholder="Tenant ID"
            id="newOrganisationTenantId"
            required
            value={newOrganisationTenantId}
            onChange={(e) => setNewOrganisationTenantId(e.target.value)}
          />
        </label>
        <label htmlFor="newOrganisationPassword" className="auth_label">
          Password:
          <input
            className="auth_input"
            type="password"
            placeholder="Password"
            id="newOrganisationPassword"
            required
            value={newOrganisationPassword}
            onChange={(e) => setNewOrganisationPassword(e.target.value)}
          />
        </label>
        <button className="auth_btn" type="button" onClick={handlePopupSubmit}>
          Create New Organisation
        </button>
      </div>
      {showPopup && <PopupCard message={`Login successful as ${role}`} onClose={handlePopupClose} />}
    </div>
  )}
</div>
  );
};
