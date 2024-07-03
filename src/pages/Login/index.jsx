import { NavLink } from "react-router-dom";
import "./login.css";
import Spline from "@splinetool/react-spline";
import { useState } from "react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";

// Extract tenant_id from the URL dynamically within handleSubmit
const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; // Assumes tenant_id is the first part of the path
  }
  return null; // Return null if tenant ID is not found or not in the expected place
};

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

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authenticated, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  const [role, setRole] = useState(""); // State to store the role of the user
  const [tenantId, setTenantId] = useState(""); // State to store the tenant ID

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    setError(""); // Clear previous errors

    const data = {
      username: username,
      password: password,
    };




    fetch('https://webappbaackend.azurewebsites.net/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      setRole(data.role); // Set the role
      setTenantId(data.tenant_id); // Set the tenant ID
      setShowPopup(true); // Show the popup card
      login(data.user_id, data.tenant_id, data.role); 
    })
    .catch(error => {
      setError('Login failed. Please check your credentials and try again.');
      setIsSubmitting(false);
    });
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate(`/${tenantId}/home`);
  };

  return (
    <div className="login" style={{display:'flex',flexDirection:'row'}}>
      <div className="container" style={{width:'30%'}}>
        <div className="login_inner">
          <h2 className="login_paragraph">Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="login_form" onSubmit={handleSubmit}>
            <label htmlFor="username" className="login_label">
              <input
                className="login_input"
                type="text"
                placeholder="👤 Username"
                id="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label htmlFor="password" className="login_label">
              <input
                className="login_input"
                type="password"
                placeholder="🔑 Password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <NavLink className="login_navigate" to="/">
              register?
            </NavLink>
            <button className="login_btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
      <div style={{width:'70%'}}>
        <Spline scene="https://app.spline.design/file/51da203a-2bcb-49c3-b004-7a20d1abe595" />
      </div>
      {showPopup && <PopupCard message={`Login successful as ${role}`} onClose={handlePopupClose} />}
    </div>
  );
};
