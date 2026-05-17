import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Trash2 } from "lucide-react";
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from "./api";
import DodajPaketnik from './DodajPaketnik';
import paketnikClosed from './images/pametni_paketnik_closed.png'; 
import { TextAlignCenter } from "lucide-react";

function ChangeView({center, targetMarkerRef}) {
  const map = useMap(); 
  useEffect(() => {
    if(center){
      map.flyTo(center, 14);
      
      if(targetMarkerRef && targetMarkerRef.current){
        setTimeout(() => {
            targetMarkerRef.current.openPopup(); 
        }, 300); 
      }
    }
  }, [center, map, targetMarkerRef]); 
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

  const [focusedCenter, setFocusedCenter] = useState(null);
  const [activePopupId, setActivePopupId] = useState(null);

  const markerRefs = useRef({}); 

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
    }, [fetchPaketniki]); 

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
    
    const handleDelete = async(e, id) => {
        e.stopPropagation();
        if(window.confirm("Ali ste prepričani da želite izbrisati ta paketnik?")) {
            try {
                await api.delete(`/paketnik/${id}`); 
                alert("Uspesno izbrisano"); 
                fetchPaketniki(); 
            } catch (err) {
                console.error("Napaka: ", err); 
                alert("Napak pri brisanju"); 
            }
        }
    }; 

    const handleFocusLocker = (p) => {
        const pId = p._id || p.id; 
        setActivePopupId(pId); 
        setFocusedCenter([parseFloat(p.lat), parseFloat(p.lng)]); 
    }; 

  return (
        <div className="map-and-content-wrapper"> 
            <div className="map-frame">
                <MapContainer center={[46.0569, 14.5058]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    {focusedCenter && (
                      <ChangeView 
                        center={focusedCenter} 
                        targetMarkerRef={{ current: markerRefs.current[activePopupId] }} 
                      />
                    )}

                    {paketniki
                        .filter(p => p.lat && p.lng && !isNaN(parseFloat(p.lat)) && !isNaN(parseFloat(p.lng)))
                        .map((p) => {
                            const pId = p._id || p.id;
                            return (
                                <Marker 
                                    key={pId} 
                                    ref={(el) => { if (el) markerRefs.current[pId] = el; }}
                                    position={[parseFloat(p.lat), parseFloat(p.lng)]} 
                                    icon={customIcon}
                                    eventHandlers={{
                                        click: () => handleFocusLocker(p),
                                    }}
                                >
                                    <Popup>
                                        <div className="map-popup-custom" style={{ padding: '5px', textAlign: 'center' }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{p.ime}</h3>
                                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>{p.lokacija}</p>
                                            
                                            <button 
                                                onClick={() => onSelect && onSelect(p)}
                                                style={{
                                                    background: selectedLocker?._id === pId ? '#4BB543' : '#000',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    width: '100%'
                                                }}
                                            >
                                                {selectedLocker?._id === pId ? "✓ IZBRANO" : "IZBERI TO LOKACIJO"}
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
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
                        const pId = p._id || p.id;
                        const isSelected = selectedLocker?._id === pId;
                        const isFocused = activePopupId === pId;

                        return (
                            <div 
                                key={pId} 
                                className={`location-item ${isSelected ? 'confirmed' : ''} ${isFocused ? 'active' : ''}`}
                                onClick={() => handleFocusLocker(p)}
                                style={{ 
                                    padding: '12px 10px', 
                                    borderBottom: '1px solid #eee', 
                                    cursor: 'pointer',
                                    background: isSelected ? '#d4edda' : isFocused ? '#e6e6e6' : 'transparent',
                                    borderLeft: isSelected ? '4px solid #28a745' : isFocused ? '4px solid #000' : '4px solid transparent',
                                    display: 'flex',            
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    transition: 'background 0.2s ease'
                                }}
                            >
                                <div>
                                    <strong>{p.ime}</strong> - {p.lokacija}
                                    {isSelected && <span style={{ color: '#28a745', marginLeft: '10px', fontSize: '12px' }}>✓ Izbrano</span>}
                                </div>

                                {isAdmin && (
                                    <button 
                                        onClick={(e) => handleDelete(e, pId)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4d4d',
                                            cursor: 'pointer',
                                            padding: '5px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
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