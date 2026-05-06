import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserContext, UserProvider } from './userContext.js';
import './index.css';
import Login from './Login';
import Logout from './Logout';
import Profile from './Profile';
import Register from './Register';
import Home from './Home'; 

function AppContent() {
  const { user } = useContext(UserContext);

  return (
    <>
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
            <Link to="/" className="navbar-text">Domov</Link>
            
            {user ? (
                <>
                    <Link to="/profile" className="navbar-text">Profil</Link>
                    <Link to="/logout" className="navbar-text">Odjava</Link>
                    {/* Profilna slika */}
                </>
            ) : (
                <>
                    <Link to="/login" className="navbar-text">Prijava</Link>
                    <Link to="/register" className="navbar-text">Registracija</Link>
                </>
            )}
        </div>
      </nav>

      <div style={{ padding: "50px" }}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/profile" element={<Profile />} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;