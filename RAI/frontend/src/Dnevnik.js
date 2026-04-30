import React, { useEffect, useState } from 'react';
import api from './api';

function Dnevnik() {
  const [zapisi, setZapisi] = useState([]);

  useEffect(() => {
    api.get('/dnevnik')
      .then(res => setZapisi(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <h2>Dnevnik Odklepov</h2>
  );
}

export default Dnevnik;