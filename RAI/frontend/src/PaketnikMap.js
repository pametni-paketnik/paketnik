import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// instaliraj: npm install leaflet react-leaflet

import paketnikClosed from './images/pametni_paketnik_closed.png'; 

const customIcon = L.icon({
  iconUrl: paketnikClosed, 
  iconSize: [35, 45], 
  iconAnchor: [20, 40], 
  popupAnchor: [0, -40]
}); 

const paketniki = [
  {
    id: 1,
    name: "Paketnik Petrol Dunajska",
    lat: 46.075,
    lng: 14.505,
    address: "Dunajska cesta 100, Ljubljana",
    details: "Dostop 24/7, desno od vhoda."
  },
  {
    id: 2,
    name: "Paketnik Tehnološki park",
    lat: 46.050,
    lng: 14.470,
    address: "Tehnološki park 21, Ljubljana",
    details: "Nahaja se v avli objekta B."
  }
];

const centerSlovenia = [46.0569, 14.5058];
const initialZoom = 10;

function PaketnikMap({ onSelect }) {
  return (
    <div className="map-wrapper">
      <MapContainer 
        center={centerSlovenia} 
        zoom={initialZoom} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {paketniki.map(paketnik => (
          <Marker 
            key={paketnik.id} 
            position={[paketnik.lat, paketnik.lng]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <h3>{paketnik.name}</h3>
                <p><strong>Naslov:</strong> {paketnik.address}</p>
                <p className="details">{paketnik.details}</p>
                <button 
                  className="select-button-brown"
                  onClick={() => onSelect ? onSelect(paketnik) : alert(paketnik.name)}
                >
                  Izberi za dostavo
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default PaketnikMap;