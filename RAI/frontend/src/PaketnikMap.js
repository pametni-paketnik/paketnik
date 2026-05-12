import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// instaliraj: npm install leaflet react-leaflet
import api from "./api";
import DodajPaketnik from './DodajPaketnik'; 

import paketnikClosed from './images/pametni_paketnik_closed.png'; 

const customIcon = L.icon({
  iconUrl: paketnikClosed, 
  iconSize: [35, 45], 
  iconAnchor: [17, 45], 
  popupAnchor: [0, -40]
}); 

const centerSlovenia = [46.0569, 14.5058];
const initialZoom = 10;

function PaketnikMap({ onSelect, user }) {
  const [paketniki, setPaketniki] = useState([]); 

  const pridobiPaketnike = async () => {
    try{
      const res = await api.get('/paketnik'); 
      setPaketniki(res.data); 
    } catch(err){
      console.log("Napaka: ", err.response?.data?.message || err.message); 
    }
  }; 
  useEffect(() => {
    pridobiPaketnike(); 
  }, []); 
 
return (
    <div className="map-page-container">
      {/* Glavna kartica, ki razdeli vsebino na levo in desno */}
      <div className="map-card-layout">
        
        <div className="map-wrapper">
          <MapContainer 
            center={centerSlovenia} 
            zoom={initialZoom} 
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {paketniki.map(paketnik => (
              paketnik.lat && paketnik.lng && (
                <Marker 
                  key={paketnik._id} 
                  position={[paketnik.lat, paketnik.lng]}
                  icon={customIcon}
                >
                  <Popup className="custom-popup">
                    <div className="popup-content">
                      <h3>{paketnik.ime}</h3> 
                      <p><strong>Naslov:</strong> {paketnik.lokacija}</p>
                      <button 
                        className="select-button-brown"
                        onClick={() => onSelect ? onSelect(paketnik) : alert(paketnik.ime)}
                      >
                        Izberi za dostavo
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </div>

        <div className="admin-map-controls">
          {user && user.vloga === 'admin' ? (
            <>
              <DodajPaketnik onSuccess={pridobiPaketnike} />
            </>
          ) : (
            <div className="user-info-section">
              <h2 className="form-title">Izberi paketnik</h2>
              <p>Na zemljevidu klikni na ikono paketnika in ga izberi za dostavo tvojega naročila.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default PaketnikMap;