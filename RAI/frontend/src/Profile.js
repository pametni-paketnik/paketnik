import React, { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from "./userContext"
import api from './api';
import { Navigate, useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import defaultImage from "./images/default.jpg";

function Profile() {
  const { user, setUserContext } = useContext(UserContext);
  const [loading, setLoading] = useState(!user);
  const navigate = useNavigate(); 

  const [ime, setIme] = useState('');
  const [priimek, setPriimek] = useState('');
  const [profilnaSlika, setSlika] = useState('');

  const [sporocilo, setSporocilo] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/uporabnik/profile')
      .then(res => {
        const podatki = res.data;
        setUserContext(podatki);

        setIme(podatki.ime || '');
        setPriimek(podatki.priimek || '');
        setSlika(podatki.profilna_slika || '');

        setLoading(false);
      })
      .catch(err => {
        console.log("Niste prijavljeni");
        setLoading(false);
      });
  }, []);

  const [izbranaDatoteka, setIzbranaDatoteka] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIzbranaDatoteka(file);
    const previewUrl = URL.createObjectURL(file);
    setSlika(previewUrl);
  };

  const shraniProfil = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("ime", ime);
      formData.append("priimek", priimek);

      if (izbranaDatoteka) {
        formData.append("profilna_slika", izbranaDatoteka);
      }

      await api.put(`/uporabnik/${user._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await api.get("/uporabnik/profile");
      setUserContext(res.data);

      setSlika(res.data.profilna_slika || "");
      setIzbranaDatoteka(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSporocilo("Profil je bil uspešno posodobljen.");
      setTimeout(() => {
        setSporocilo("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setSporocilo("Napaka pri posodabljanju profila.");
    }
  };

  if (loading && !user) return (
    <div className="flex justify-center items-center h-screen text-[#4B7337]">
      <p className="animate-pulse font-medium">Nalaganje profila InPlant...</p>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="register-container">
      <div className="profile-card">
        <div className="register-form-section profile-form-section">
          <div className="form-header profile-header-row">
            <div className="profile-header-text">
              <h1 className="uppercase-text">Profil</h1>
              <p>Spremenite ime, priimek in profilno sliko.</p>
            </div>

            <div className="profile-header-image-wrapper">
              <img
                src={profilnaSlika || defaultImage}
                alt="Profilna slika"
                className="profile-header-image"
              />
            </div>
          </div>

          <form onSubmit={shraniProfil} className="register-form">
            <div className="input-group-row">
              <input
                type="text"
                placeholder="IME"
                required
                className="clean-input"
                value={ime}
                onChange={(e) => setIme(e.target.value)}
              />

              <input
                type="text"
                placeholder="PRIIMEK"
                required
                className="clean-input"
                value={priimek}
                onChange={(e) => setPriimek(e.target.value)}
              />

              <div className="file-upload-wrapper">
                <label className="file-upload-label uppercase-text">
                  Izberi profilno sliko
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-upload-input"
                  ref={fileInputRef}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn uppercase-text">
              Shrani spremembe
            </button>
          </form>

          {sporocilo && (
            <div className="profile-message">
              {sporocilo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 