import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from "./userContext"
import api from './api';
import { Navigate, useNavigate } from 'react-router-dom';

function Profile() {
  const { user, setUserContext } = useContext(UserContext);
  const [loading, setLoading] = useState(!user);
  const navigate = useNavigate(); 

  useEffect(() => {
    api.get('/uporabnik/profile')
      .then(res => {
        setUserContext(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Niste prijavljeni");
        setLoading(false);
      });
  }, []);

  if (loading && !user) return (
    <div className="flex justify-center items-center h-screen text-[#4B7337]">
      <p className="animate-pulse font-medium">Nalaganje profila InPlant...</p>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9F8] p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mt-2 text-slate-900">
          Pozdrav, <span className="text-[#4B7337]">{user.ime}</span>!
        </h1>
      </div>
    </div>
  );
}

export default Profile; 