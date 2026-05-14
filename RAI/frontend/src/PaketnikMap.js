import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// instaliraj: npm install leaflet react-leaflet
import api from "./api";
import DodajPaketnik from './DodajPaketnik';
import paketnikClosed from './images/pametni_paketnik_closed.png'; 
import { TextAlignCenter } from "lucide-react";

function ChangeView({center}) {
  const map = useMap(); 
  useEffect(() => {
    if(center){
      map.flyTo(center, 12); 
    }
  }, [center, map]); 
  return null; 
}

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
  iconAnchor: [17, 45], 
  popupAnchor: [0, -45]
}); 

function PaketnikMap({ onSelect, user, selectedLocker }) {
  const [paketniki, setPaketniki] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
        ime: "",
        lokacija: "",
        lat: "",
        lng: ""
    });

  const isAdmin = user && user.vloga === 'admin';

  const fetchPaketniki = useCallback(() => {
        api.get('/paketnik').then(res => {
            setPaketniki(res.data);
            setLoading(false); 
        }).catch(() => setLoading(false));
    }, []);

    useEffect (() =>{
      fetchPaketniki(); 
    }, []); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/paketnik', formData);
            alert("Paketnik uspešno shranjen v bazo!");
            setFormData({ ime: "", lokacija: "", lat: "", lng: "" }); 
            fetchPaketniki(); 
        } catch (err) {
            console.error("Napaka pri shranjevanju:", err);
            alert("Napaka pri komunikaciji z bazo.");
        }
    };

  return (
        <div className="map-and-content-wrapper"> 
            <div className="map-frame">
                <MapContainer center={[46.0569, 14.5058]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    {selectedLocker && <ChangeView center={[parseFloat(selectedLocker.lat), parseFloat(selectedLocker.lng)]}/>}

                    {paketniki
                        .filter(p => p.lat && p.lng && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
                        .map((p) => (
                            <Marker 
                                key={p._id || p.id} 
                                position={[parseFloat(p.lat), parseFloat(p.lng)]} 
                                icon={customIcon}
                                eventHandlers={{
                                    click: () => onSelect && onSelect(p),
                                }}
                            >
                                <Popup>
                                    <strong>{p.ime}</strong> <br />
                                    {p.lokacija}
                                </Popup>
                            </Marker>
                        ))}
                    <ResizeMap />
                </MapContainer>
            </div>

            <div className="content-box-modern">
            {isAdmin && (
                <div className="form-container-modern">
                    <div className="input-group-modern">
                        <label>Ime paketnika</label>
                        <input type="text" name="ime" value={formData.ime} onChange={handleInputChange} placeholder="052" />
                    </div>
                    <div className="row-modern" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <div className="input-group-modern">
                            <label>Latitude</label>
                            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} placeholder="46.0567"/>
                        </div>
                        <div className="input-group-modern">
                            <label>Longitude</label>
                            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} placeholder="45.0556"/>
                        </div>
                    </div>
                    <div className="input-group-modern">
                        <label>Naslov</label>
                        <input type="text" name="lokacija" value={formData.lokacija} onChange={handleInputChange} placeholder="Petrol, Celovška cesta" />
                    </div>
                    <button onClick={handleSubmit} className="checkout-submit-btn" style={{ padding: '10px 5px', fontSize: '12px'}}>
                        <span>SHRANI NOV PAKETNIK</span>
                    </button>
                </div>
            )}

            <div className="location-list-container">
                <h4>{isAdmin ? "Pregled vseh paketnikov:" : "Izberi lokacijo prevzema:"}</h4>
                <div className="location-list" style={{ maxHeight: isAdmin ? '200px' : '400px', overflowY: 'auto' }}>
                    {paketniki.map((p) => {
                        const isSelected = selectedLocker?._id === p._id || selectedLocker?.id === p.id;
                        return (
                            <div 
                                key={p._id || p.id} 
                                className={`location-item ${isSelected ? 'active' : ''}`}
                                onClick={() => onSelect && onSelect(p)}
                                style={{ 
                                    padding: '10px', 
                                    borderBottom: '1px solid #eee', 
                                    cursor: 'pointer',
                                    background: isSelected ? '#e6e6e6' : 'transparent',
                                    borderLeft: isSelected ? '4px solid #000' : '4px solid transparent'
                                }}
                            >
                                <strong>{p.ime}</strong> - {p.lokacija}
                            </div>
                        );
                      })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaketnikMap;