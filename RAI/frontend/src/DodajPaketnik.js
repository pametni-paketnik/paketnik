import React, { useState } from "react";
import api from './api'; 

function DodajPaketnik({onSuccess}){
    const [formData, setFormData] = useState({
        ime: '', 
        lokacija: '', 
        lat: '', 
        lng: '', 
        details: ''
    }); 

    const handleChange = (e) => {
        const val = (e.target.name === 'lat' || e.target.name === 'lng') ? e.target.value.replace(',', '.') : e.target.value;
        setFormData({...formData, [e.target.name]: val}); 
    }; 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const data = { ...formData, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) };
        if (isNaN(data.lat) || isNaN(data.lng)) return alert("Vnesi veljavne koordinate!");

        try {
            await api.post('/paketnik', data); 
            alert("Paketnik dodan!");
            setFormData({ ime: '', lokacija: '', lat: '', lng: '', details: '' });
            if(onSuccess) onSuccess(); 
        } catch(err) { alert("Napaka pri shranjevanju."); }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-admin-form">
            <h3 className="checkout-section-title">Admin: Nov paketnik</h3>
            <input name="ime" placeholder="Ime paketnika" value={formData.ime} onChange={handleChange} className="checkout-styled-input" required />
            <input name="lokacija" placeholder="Naslov (Ulica 12, Kraj)" value={formData.lokacija} onChange={handleChange} className="checkout-styled-input" required />
            <div style={{display:'flex', gap:'10px'}}>
                <input name="lat" placeholder="Latitude (npr. 46.05)" value={formData.lat} onChange={handleChange} className="checkout-styled-input" required />
                <input name="lng" placeholder="Longitude (npr. 14.50)" value={formData.lng} onChange={handleChange} className="checkout-styled-input" required />
            </div>
            <textarea name="details" placeholder="Dodatne informacije..." value={formData.details} onChange={handleChange} className="checkout-styled-input" />
            <button type="submit" className="checkout-submit-btn">SHRANI PAKETNIK</button>
        </form>
    );
}
export default DodajPaketnik;