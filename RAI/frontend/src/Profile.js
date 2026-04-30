import React, { useEffect, useState } from 'react';
import api from './api';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/users/profile')
      .then(res => setUser(res.data))
      .catch(err => console.log("Niste prijavljeni"));
  }, []);

  if (!user) return <p>Nalaganje profila ali niste prijavljeni...</p>;

  return (
    <div>
      <h2>Moj Profil</h2>
      <p><strong>Ime:</strong> {user.ime} {user.priimek}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Vloga:</strong> {user.vloga}</p>
      <p><strong>Registriran:</strong> {user.datum_registracije}</p>
    </div>
  );
}

export default Profile;