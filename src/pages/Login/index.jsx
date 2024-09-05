import { NavLink } from "react-router-dom";
import "./login.css";
import Spline from "@splinetool/react-spline";
import { useState } from "react";
import { useAuth } from "../../authContext";
import { useNavigate } from "react-router-dom";
import Loginimage from '../../assets/Loginimage.png';
import logo from "../../assets/logo.png"

const getTenantIdFromUrl = () => {
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1];
  }
  return null;
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [role, setRole] = useState("");
  const [tenantId, setTenantId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    const data = {
      username: username,
      password: password,
    };

    fetch('https://backenreal-hgg2d7a0d9fzctgj.eastus-01.azurewebsites.net/login/', {
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
      setRole(data.role);
      setTenantId(data.tenant_id);
      setShowPopup(true);
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
    <div className="auth">
      <div className="auth_wrapper">
        <div className="login_form_container">
        <div className="navbar2">
      <div className="nav-logo-container">
        <img src={logo} alt="Logo" className="nav-logo" />
        <span className="nav-logo-title">Nuren AI</span>
      </div>
      </div>
          <div className="auth_inner">
            <h2 className="auth_paragraph">Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form className="auth_form" onSubmit={handleSubmit}>
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
              <label htmlFor="password" className="auth_label">
                <input
                  className="auth_input"
                  type="password"
                  placeholder="🔑 Password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <NavLink className="auth_login" to="/">
                Register?
              </NavLink>
              <button className="auth_btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
        <div className="spline_scene">
          <img style={{backgroundSize:'contain'}} src={Loginimage} alt="" />
        </div>
      </div>
      {showPopup && <PopupCard message={`Login successful as ${role}`} onClose={handlePopupClose} />}
    </div>
  );
};
