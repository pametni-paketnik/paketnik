import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import Narocila from './Narocila';
import Dnevnik from './Dnevnik';

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/">Prijava</Link> | 
        <Link to="/profile"> Profil</Link> | 
        <Link to="/narocila"> Naročila</Link> | 
        <Link to="/dnevnik"> Dnevnik</Link>
      </nav>

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/narocila" element={<Narocila />} />
          <Route path="/dnevnik" element={<Dnevnik />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;