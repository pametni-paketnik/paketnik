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
        setFormData({...formData, [e.target.name]: e.target.value}); 
    }; 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try{
            const dataToSend = {
                ime: formData.ime,
                lokacija: formData.lokacija,
                lat: Number(formData.lat), // Prisili pretvorbo v številko
                lng: Number(formData.lng), // Prisili pretvorbo v številko
                details: formData.details
            };

            if (isNaN(dataToSend.lat) || isNaN(dataToSend.lng)) {
                alert("Prosim vnesite veljavne koordinate.");
                return;
            }

            const res = await api.post('/paketnik', dataToSend); 

            if(res.status === 201 || res.status === 200){
                alert("Paketnik uspešno dodan"); 
                setFormData({ ime: '', lokacija: '', lat: '', lng: '', details: '' });
                if(onSuccess) onSuccess(); 
            }
        }catch(err){
            console.error("Napaka pri dodajanju paketnika: ", err); 
            alert("Napaka: " + (err.message)); 
        }
    }; 

    return (
        <div className="paketnik-form-container">
            <form onSubmit={handleSubmit} className="paketnik-form-box">
                <h3 className="form-title">Dodaj nov paketnik</h3>
                <div className="admin-form-row">
                    <input 
                        className="admin-form-input"
                        name="ime"
                        type="text" 
                        placeholder="Ime paketnika" 
                        value={formData.ime} 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        className="admin-form-input"
                        name="lokacija"
                        type="text" 
                        placeholder="Lokacija (Naslov)" 
                        value={formData.lokacija} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="admin-form-row">
                    <input 
                        className="admin-form-input"
                        name="lat"
                        type="number" 
                        step="any" 
                        placeholder="Latituda (npr. 46.05)" 
                        value={formData.lat} 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        className="admin-form-input"
                        name="lng"
                        type="number" 
                        step="any" 
                        placeholder="Longituda (npr. 14.50)" 
                        value={formData.lng} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <textarea 
                    className="admin-form-textarea"
                    name="details"
                    placeholder="Dodatne podrobnosti (Dostop 24/7...)" 
                    value={formData.details} 
                    onChange={handleChange}
                />

                <button type="submit" className="admin-form-button">
                    Dodaj paketnik na zemljevid
                </button>
            </form>
        </div>
    );
}

export default DodajPaketnik;