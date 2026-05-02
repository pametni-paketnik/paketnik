import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import Register from './Register';
import Home from './Home'; 

function App() {
  return (
    <Router>
      <nav style={{ 
        padding: "20px 80px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        backgroundColor: "white" 
      }}>
        <div className="logo uppercase-text" style={{ color: "#6F4E37", fontWeight: "900", fontSize: "1.2rem" }}>
            InPlant
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/" className="uppercase-text" style={{ textDecoration: "none", color: "#333", fontSize: "0.8rem", fontWeight: "700" }}>Domov</Link>
            <Link to="/login" className="uppercase-text" style={{ textDecoration: "none", color: "#333", fontSize: "0.8rem", fontWeight: "700" }}>Prijava</Link>
            <Link to="/register" className="uppercase-text" style={{ textDecoration: "none", color: "#333", fontSize: "0.8rem", fontWeight: "700" }}>Registracija</Link>
        </div>
    </nav>

      <div style={{ padding: "50px" }}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/profile" element={<Profile />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;