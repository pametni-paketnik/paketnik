import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [geslo, setGeslo] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/login', { email, geslo });
      alert("Prijava uspešna!");
      navigate('/profile');
    } catch (err) {
      alert("Napaka pri prijavi: " + err.response?.data?.message);
    }
  };

  return (
    <div>
      <h2>Prijava</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required /><br/>
        <input type="password" placeholder="Geslo" onChange={e => setGeslo(e.target.value)} required /><br/>
        <button type="submit">Prijavi se</button>
      </form>
    </div>
  );
}

export default Login;