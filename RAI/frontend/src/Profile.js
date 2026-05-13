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

  const [stevilkaKartice, setStevilkaKartice] = useState('');
  const [imeNaKartici, setImeNaKartici] = useState('');
  const [datumPoteka, setDatumPoteka] = useState('');
  const [cvv, setCvv] = useState('');

  const [sporociloKartica, setSporociloKartica] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/uporabnik/profile')
      .then(res => {
        const podatki = res.data;
        setUserContext(podatki);

        setIme(podatki.ime || '');
        setPriimek(podatki.priimek || '');
        setSlika(podatki.profilna_slika || '');

        setStevilkaKartice(podatki.stevilka_kartice || '');
        setImeNaKartici(podatki.ime_na_kartici || '');
        setDatumPoteka(podatki.datum_poteka || '');
        setCvv(podatki.cvv || '');

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
      const podatki = res.data;

      setUserContext(podatki);

      setIme(podatki.ime || '');
      setPriimek(podatki.priimek || '');
      setSlika(podatki.profilna_slika || '');

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

  const handleStevilkaKarticeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 16);

    value = value.replace(/(.{4})/g, '$1 ').trim();

    setStevilkaKartice(value);
  };

  const handleImeNaKarticiChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-zÀ-ž\s]/g, '');
    setImeNaKartici(value.toUpperCase());
  };

  const handleDatumPotekaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 4);

    if (value.length >= 3) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    if (value.length >= 2) {
      const month = parseInt(value.slice(0, 2));
      if (month < 1 || month > 12) {
        return;
      }
    }

    setDatumPoteka(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 3);
    setCvv(value);
  };

  const shraniKartico = async () => {
    try {
      const formData = new FormData();

      formData.append("stevilka_kartice", stevilkaKartice);
      formData.append("ime_na_kartici", imeNaKartici);
      formData.append("datum_poteka", datumPoteka);
      formData.append("cvv", cvv);

      await api.put(`/uporabnik/${user._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const res = await api.get("/uporabnik/profile");
      const podatki = res.data;

      setUserContext(podatki);

      setStevilkaKartice(podatki.stevilka_kartice || "");
      setImeNaKartici(podatki.ime_na_kartici || "");
      setDatumPoteka(podatki.datum_poteka || "");
      setCvv(podatki.cvv || "");

      setSporociloKartica("Kartica je bila uspešno shranjena.");

      setTimeout(() => {
        setSporociloKartica("");
      }, 3000);

    } catch (err) {
      console.error(err);
      setSporociloKartica("Napaka pri shranjevanju kartice.");
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
      <div className="profile-layout">

        {/* Zgornji dve kartici */}
        <div className="profile-top-grid">

          {/* LEVO: Uporabniški račun */}
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

          {/* DESNO: Kartica */}
          <div className="profile-card">
            <div className="register-form-section profile-form-section">
              <div className="form-header">
                <h1 className="uppercase-text">Kartica</h1>
                <p>Dodajte podatke za plačilo.</p>
              </div>

              <input
                type="text"
                placeholder="ŠTEVILKA KARTICE"
                className="clean-input"
                value={stevilkaKartice}
                onChange={handleStevilkaKarticeChange}
                maxLength={19}
              />

              <input
                type="text"
                placeholder="IME IN PRIIMEK NA KARTICI"
                className="clean-input"
                value={imeNaKartici}
                onChange={handleImeNaKarticiChange}
              />

              <input
                type="text"
                placeholder="DATUM POTEKA (MM/YY)"
                className="clean-input"
                value={datumPoteka}
                onChange={handleDatumPotekaChange}
                maxLength={5}
              />

              <input
                type="text"
                placeholder="CVV"
                className="clean-input"
                value={cvv}
                onChange={handleCvvChange}
                maxLength={3}
              />

              <button
                type="button"
                className="submit-btn uppercase-text"
                onClick={shraniKartico}
              >
                Dodaj kartico
              </button>

              {sporociloKartica && (
                <div className="profile-message">
                  {sporociloKartica}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SPODAJ: Zgodovina naročil */}
        <div className="profile-card order-history-card">
          <div className="register-form-section profile-form-section">
            <div className="form-header">
              <h1 className="uppercase-text">Zgodovina naročil</h1>
              <p>Pregled vseh vaših preteklih naročil.</p>
            </div>

            <div className="order-history-list">
              {/* Tukaj boš kasneje prikazala naročila iz baze */}
              <div className="order-history-empty">
                Trenutno še nimate nobenega naročila.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile; 