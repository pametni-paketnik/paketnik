import React, { useState } from "react";
import api from './api'; 
import './index.css'; 

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
            <div className="checkout-input-group">
                <label>Ime</label>
                <input name="ime" value={formData.ime} onChange={handleChange} className="checkout-styled-input" required />
            </div>
            <div className="checkout-input-group">
                <label>Lokacija</label>
                <input name="lokacija" value={formData.lokacija} onChange={handleChange} className="checkout-styled-input" required />
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                <div className="checkout-input-group" style={{flex:1}}>
                    <label>Lat</label>
                    <input name="lat" value={formData.lat} onChange={handleChange} className="checkout-styled-input" required />
                </div>
                <div className="checkout-input-group" style={{flex:1}}>
                    <label>Lng</label>
                    <input name="lng" value={formData.lng} onChange={handleChange} className="checkout-styled-input" required />
                </div>
            </div>
            <div className="checkout-input-group">
                <label>Opis / Details</label>
                <textarea name="details" value={formData.details} onChange={handleChange} className="checkout-styled-input" style={{minHeight:'80px'}} />
            </div>
            <button type="submit" className="checkout-submit-btn"><span>SHRANI PAKETNIK</span></button>
        </form>
    );
}

export default DodajPaketnik;