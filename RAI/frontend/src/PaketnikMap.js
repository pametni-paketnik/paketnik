import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// instaliraj: npm install leaflet react-leaflet
import api from "./api";
import DodajPaketnik from './DodajPaketnik';
import paketnikClosed from './images/pametni_paketnik_closed.png'; 
import { Loader } from "lucide-react";

function ResizeMap() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => { map.invalidateSize(); }, 250);
    }, [map]);
    return null;
}

const customIcon = L.icon({
  iconUrl: paketnikClosed, 
  iconSize: [35, 45], 
  iconAnchor: [17, 45]
}); 

const centerSlovenia = [46.0569, 14.5058];
const initialZoom = 10;

function PaketnikMap({ onSelect, user }) {
  const [paketniki, setPaketniki] = useState([]); 
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        api.get('/paketnik')
            .then(res => {
                setPaketniki(res.data);
                setLoading(false); // Podatki so tu
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []); 

    const handleMarkerClick = (p) => {
        setSelectedLocal(p); 
        if (onSelect) onSelect(p); 
    };

    if (loading) return <div>Nalagam zemljevid...</div>
 
  return (
        <div className="checkout-map-wrapper">
            <div className="checkout-map-display">
                <MapContainer center={[46.0569, 14.5058]} zoom={10} style={{ height: "100%", width: "100%" }}>
                    <ResizeMap />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {paketniki && paketniki.map(p => {
                      const hasCoords = p.lat !== undefined && p.lng !== undefined && p.lat !== null && p.lng !== null;

                      if (!hasCoords) return null; 

                      return (
                          <Marker 
                              key={p._id} 
                              position={[parseFloat(p.lat), parseFloat(p.lng)]} // parseFloat za vsak slučaj
                              icon={customIcon} 
                              eventHandlers={{ click: () => handleMarkerClick(p) }} 
                          />
                      );
                  })}
                </MapContainer>
            </div>

            <div className="checkout-map-inputs">
                <div className="checkout-input-group">
                    <label>Izbran paketnik</label>
                    <input readOnly value={selectedLocal?.ime || ""} className="checkout-styled-input" placeholder="Klikni na ikono..." />
                </div>
                <div className="checkout-input-group">
                    <label>Lokacija</label>
                    <input readOnly value={selectedLocal?.lokacija || ""} className="checkout-styled-input" placeholder="Naslov paketnika..." />
                </div>
                <div className="checkout-input-group">
                    <label>Podrobnosti (Opis)</label>
                    <textarea readOnly value={selectedLocal?.details || ""} className="checkout-styled-input" style={{minHeight: '60px', resize: 'none'}} placeholder="Dodatne informacije o dostopu..." />
                </div>
            </div>
        </div>
    );
}

export default PaketnikMap;