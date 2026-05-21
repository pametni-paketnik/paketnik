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
  const [telefonskaStevilka, setTelefonskaStevilka] = useState('');
  const [profilnaSlika, setSlika] = useState('');

  const [sporocilo, setSporocilo] = useState('');

  const [stevilkaKartice, setStevilkaKartice] = useState('');
  const [imeNaKartici, setImeNaKartici] = useState('');
  const [datumPoteka, setDatumPoteka] = useState('');
  const [cvv, setCvv] = useState('');

  const [sporociloKartica, setSporociloKartica] = useState("");

  const fileInputRef = useRef(null);

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/uporabnik/profile')
      .then(res => {
        const podatki = res.data;
        setUserContext(podatki);

        setIme(podatki.ime || '');
        setPriimek(podatki.priimek || '');
        setTelefonskaStevilka(formatirajTelefonsko(podatki.telefonska_stevilka || ''));
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

  useEffect(() => {
    if (!user?._id) return;

    api.get(`/narocilo/uporabnik/${user._id}`)
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));

  }, [user]);

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
      formData.append("telefonska_stevilka", telefonskaStevilka.replace(/\s/g, ''));

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
      setTelefonskaStevilka(formatirajTelefonsko(podatki.telefonska_stevilka));
      setSlika(podatki.profilna_slika || '');

      setIzbranaDatoteka(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSporocilo("Profile has been successfully updated.");

      setTimeout(() => {
        setSporocilo("");
      }, 3000);

    } catch (err) {
      console.error(err);
      setSporocilo("Error updating profile.");
    }
  };

  const handleTelefonskaStevilkaChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 9);

    value = value.match(/.{1,3}/g)?.join(' ') || '';

    setTelefonskaStevilka(value);
  };

  const formatirajTelefonsko = (value) => {
    if (!value) return '';

    value = value.replace(/\D/g, '');
    value = value.slice(0, 9);

    return value.match(/.{1,3}/g)?.join(' ') || '';
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

      setSporociloKartica("The card was successfully saved.");

      setTimeout(() => {
        setSporociloKartica("");
      }, 3000);

    } catch (err) {
      console.error(err);
      setSporociloKartica("Error saving card.");
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
        {/* ZAČETEK GRID-A KI DRŽI VSE 3 KARTICE V ENI VRSTI */}
        <div className="profile-top-grid">
          
          {/* 1. KARTICA: PROFIL */}
          <div className="profile-card">
            <div className="register-form-section profile-form-section">
              <div className="form-header profile-header-row">
                <div className="profile-header-text">
                  <h1 className="uppercase-text">Profile</h1>
                  <p>Change your first name, last name, and profile picture.</p>
                </div>
                <div className="profile-header-image-wrapper">
                  <img
                    src={profilnaSlika || defaultImage}
                    alt="Profile image"
                    className="profile-header-image"
                  />
                </div>
              </div>

              <form onSubmit={shraniProfil} className="register-form">
                <div className="input-group-row">
                  <div className="input-group-modern">
                    <label>Name: </label>
                    <input
                      type="text"
                      placeholder="NAME"
                      required
                      className="input-group-modern"
                      value={ime}
                      onChange={(e) => setIme(e.target.value)}
                    />
                  </div>
                  <div className="input-group-modern">
                    <label>Surname: </label>
                    <input
                      type="text"
                      placeholder="SURNAME"
                      required
                      className="input-group-modern"
                      value={priimek}
                      onChange={(e) => setPriimek(e.target.value)}
                    />
                  </div>

                  <div className="input-group-modern">
                    <label>Phone number: </label>
                    <input
                      type="text"
                      placeholder="PHONE NUMBER"
                      className="input-group-modern"
                      value={telefonskaStevilka}
                      maxLength={11}
                      onChange={handleTelefonskaStevilkaChange}
                    />
                  </div>

                  <div className="file-upload-wrapper">
                    <label className="file-upload-label uppercase-text">Choose a profile image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="input-group-modern"
                      ref={fileInputRef}
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn uppercase-text">
                  Save changes
                </button>
              </form>

              {sporocilo && <div className="profile-message">{sporocilo}</div>}
            </div>
          </div>

          {/* 2. KARTICA: KARTICA */}
          <div className="profile-card">
            <div className="register-form-section profile-form-section">
              <div className="form-header">
                <h1 className="uppercase-text">Card</h1>
                <p>Add payment information.</p>
              </div>

              <div className="input-group-modern">
                <label>Card number: </label>
                <input
                  type="text"
                  placeholder="CARD NUMBER"
                  required
                  className="input-group-modern"
                  value={stevilkaKartice}
                  onChange={handleStevilkaKarticeChange}
                  maxLength={19}
                />
              </div>

              <div className="input-group-modern">
                <label>Name on the card: </label>
                <input
                  type="text"
                  placeholder="NAME ON THE CARD"
                  required
                  className="input-group-modern"
                  value={imeNaKartici}
                  onChange={handleImeNaKarticiChange}
                />
              </div>
              
              <div className="card-input-row">
                <div className="input-group-modern">
                  <label>Expiry Date: </label>
                  <input
                    type="text"
                    placeholder="EXPIRY DATE"
                    required
                    className="input-group-modern"
                    value={datumPoteka}
                    onChange={handleDatumPotekaChange}
                    maxLength={5}
                  />
                </div>

                <div className="input-group-modern">
                  <label>CVV: </label>
                  <input
                    type="text"
                    placeholder="CVV"
                    required
                    className="input-group-modern"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={3}
                  />
                </div>
              </div>

              <button
                type="button"
                className="submit-btn uppercase-text"
                onClick={shraniKartico}
              >
                Add card
              </button>

              {sporociloKartica && <div className="profile-message">{sporociloKartica}</div>}
            </div>
          </div>
        </div>

        <div className="profile-card order-history-card full-width">
          {/* 3. KARTICA: ZGODOVINA NAROČIL (Prestavljeno sem!) */}
          <div className="profile-card order-history-card">
            <div className="register-form-section profile-form-section">
              <div className="form-header">
                <h1 className="uppercase-text">Order history</h1>
                <p>Overview of all your past orders.</p>
                <div className="order-history-list scroll-area">
                  {orders.length === 0 ? (
                    <div className="order-history-empty">
                      Trenutno še nimate nobenega naročila.
                    </div>
                  ) : (
                    <div className="orders-grid">
                      {orders.map((order) => (
                        <div key={order._id} className="order-card-modern">

                          <div className="order-header">
                            <h3><span className="order-details">Order</span> #{order.koda_za_odpiranje}</h3>
                            <span className={`status ${order.status}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="order-body">
                            <p><b className="order-details">Price:</b> {order.skupna_cena} €</p>
                            <p><b className="order-details">Date:</b> {new Date(order.createdAt).toLocaleDateString()}</p>

                            <div className="order-products">
                              {order.izdelki.map((i, idx) => (
                                <div key={idx} className="order-product">
                                  <span>{i.ime_izdelka}</span>
                                  <span>x{i.kolicina}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div> 
        {/* KONEC GRID-A */}
      </div>
    </div>
  );
}

export default Profile;