import React, { useEffect, useState } from 'react';
import api from './api';

function Narocila() {
  const [narocila, setNarocila] = useState([]);

  useEffect(() => {
    api.get('/narocila') // Preveri če imaš to pot v backendu
      .then(res => setNarocila(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Seznam Naročil</h2>
      <ul>
        {narocila.map(n => (
          <li key={n._id}>
            {n.vrsta_cvetja} - Paketnik: {n.paketnik_id?.lokacija || "Neznano"} 
            ({n.prevzeto ? "Prevzeto" : "Čaka"})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Narocila;