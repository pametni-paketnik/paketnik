import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import Register from './Register';

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/">Prijava</Link> | 
        <Link to="/profile"> Profil</Link> | 
        <Link to="/register"> Registracija</Link>
      </nav>

      <div style={{ padding: "50px" }}>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/profile" element={<Profile />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;