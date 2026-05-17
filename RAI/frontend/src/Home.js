import React, { useContext, useState, useEffect, useRef } from 'react';
import api from './api';
import { ArrowLeft, ShoppingCart, Trash, Heart, ArrowRight, Bold, Sun, Droplet, Tag, Cast } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserContext } from './userContext'
import './index.css';
import paketnikImg from './images/pametni_paketnik_open.png';

// popravek slike na vrhu 
function Home() {
    const { user } = useContext(UserContext); 
    const [plants, setPlants] = useState([]); 
    const [selectedPlant, setSelectedPlant] = useState(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeFeature, setActiveFeature] = useState('water'); 
    const [cartCount, setCartCount] = useState(0); 

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get('/plant'); 
                setPlants(res.data);
            } catch (err) {
                console.error("Napaka pri pridobivanju rastlin", err);
            }
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); 
        }; 

        fetchPlants();
        window.addEventListener('resize', handleResize); 
        return () => {
            window.removeEventListener('resize', handleResize); 
        };
    }, []);

    useEffect(() => {
        if (plants.length > 0 && scrollRef.current && !selectedPlant) {
            const container = scrollRef.current;
            
            if (window.innerWidth > 768) {
                container.scrollTop = container.scrollHeight / 4;
            }
        }
        if(selectedPlant){
            setActiveFeature('water'); 

            const currentCart = JSON.parse(localStorage.getItem('cart') || []); 
            setCartCount(currentCart.length); 
        }
    }, [plants.length, selectedPlant]);
    const navigate = useNavigate(); 

    const handleAddToCart = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        
        if(currentCart.length >= 2){
            alert("Naročilo je omejeno na največ 2 roži naenkrat. Prosim dokončajte svoje naročilo"); 
            return; 
        }
        localStorage.setItem('cart', JSON.stringify([...currentCart, selectedPlant])); 
        alert(`${selectedPlant.name} dodana v košarico!`);
        navigate('/home'); 
    }

    const [outOfStock, setOutOfStock] = useState([]); 
    const toggleStock = async (id, currentState) => {
        try{
            const res = await api.put(`/plant/${id}`, {
                naZalogi: !currentState
            }, { withCredentials: true }); 

            setPlants(plants.map(p => p._id === id ? res.data : p)); 
        }catch(err){
            alert("Napak pri posodabljanu zaloge"); 
        }
    }; 

    const deletePlant = async (id) => {
        if(window.confirm("Ali si prepričan da želiš izbrisati to rastlino?")) {
            try{
                await api.delete(`/plant/${id}`, { withCredentials: true }); 
                setPlants(plants.filter(p => p._id !== id)); 
            } catch(err){
                alert("Napaka pri brisanju"); 
            }
        }
    }

    const scrollRef = useRef(null);
    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container || isMobile) return;

        const currentScroll = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        const halfHeight = scrollHeight / 2;

        if (currentScroll + viewportHeight >= scrollHeight - 10) {
            container.scrollTop = currentScroll - halfHeight;
        } 
        else if (currentScroll <= 5) {
            container.scrollTop = currentScroll + halfHeight;
        }
    };
    
    const isAdmin = user && user.vloga === 'admin'; 
    const displayPlants = window.innerWidth > 768 ? [...plants, ...plants] : plants;
    
    const getGraphData = () => {
    switch (activeFeature) {
        case 'light':
            return {
                value: selectedPlant?.iskanja_light || 140,
                path: "M 0,50 C 20,50 30,15 50,15 C 70,15 80,65 100,65 C 130,65 140,35 170,35 C 200,35 220,55 250,55 C 270,55 285,40 300,40",
                activeDayIdx: 1, 
                badgeLeft: '17%'
            };
        case 'cost':
            return {
                value: selectedPlant?.iskanja_cost || 85,
                path: "M 0,35 C 30,35 45,60 75,60 C 105,60 120,40 150,40 C 180,40 200,60 220,60 C 240,60 245,15 265,15 C 285,15 290,45 300,45",
                activeDayIdx: 5, 
                badgeLeft: '84%'
            };
        case 'water':
        default:
            return {
                value: selectedPlant?.iskanja_water || 215,
                path: "M 0,40 C 15,15 30,15 45,50 C 60,80 85,35 110,35 C 130,35 135,55 155,55 C 175,55 190,20 215,20 C 240,20 250,45 270,45 C 285,45 292,25 300,25",
                activeDayIdx: 3, 
                badgeLeft: '49%'
            };
        }
    };

    const graph = getGraphData(); 
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; 

    return (
        <div className="split-home-container">
            <section className="preview-side">
                {selectedPlant && (
                    <button className="back-button" onClick={() => setSelectedPlant(null)}> 
                        <ArrowLeft size={24} strokeWidth={3} /> Nazaj
                    </button>
                )}
                
                <div className="paketnik-visual-container">
                    <img src={paketnikImg} alt="Paketnik" className="paketnik-base" />
                    {selectedPlant && (
                        <img 
                            key={selectedPlant._id}
                            src={`http://localhost:3001${selectedPlant.path}`} 
                            alt={selectedPlant.name} 
                            className="plant-in-paketnik"
                        />
                    )}
                </div>
            </section>

            <section className="content-side">
                {selectedPlant ? (
                    <div className="plant-details-view">
                        {isAdmin && (
                            <button 
                                className="admin-delete-top-btn" 
                                onClick={() => deletePlant(selectedPlant._id)}
                                style={{
                                    position: 'absolute', top: '5px', right: '10px', border: 'none',
                                    background: 'transparent', color: '#ff4d4d', padding: '10px',
                                    width: '90px', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: '0.3s'
                                }}
                            > 
                                <Trash size={20} />
                            </button>
                        )}
                        
                        <div className="details-container">
                            <h2 className="details-title">{selectedPlant.name}</h2>
                            <p className="details-price">{selectedPlant.price}€</p>
                            <p className="details-description">
                                {selectedPlant.opis || "Ta čudovita rastlina bo osvežila vaš prostor in prinesla naravno energijo v vaš dom."}
                            </p>

                            <div className="plant-features-row">
                                <div 
                                    className={`feature-item clickable ${activeFeature === 'light' ? 'highlight' : ''}`}
                                    onClick={() => setActiveFeature('light')}
                                >
                                    <div className="feature-icon-circle">
                                        <Sun size={20} />
                                    </div>
                                    <span>{selectedPlant.svetloba || "Low light"}</span>
                                </div>

                                <div 
                                    className={`feature-item clickable ${activeFeature === 'water' ? 'highlight' : ''}`}
                                    onClick={() => setActiveFeature('water')}
                                >
                                    <div className="feature-icon-circle">
                                        <Droplet size={24} />
                                    </div>
                                    <span>{selectedPlant.zalivanje || "Water daily"}</span>
                                </div>

                                <div 
                                    className={`feature-item clickable ${activeFeature === 'cost' ? 'highlight' : ''}`}
                                    onClick={() => setActiveFeature('cost')}
                                >
                                    <div className="feature-icon-circle">
                                        <Tag size={20} />
                                    </div>
                                    <span>{selectedPlant.cena_rang || "Low cost"}</span>
                                </div>
                            </div>

                            <div className="searches-section">
                                <h3 className="searches-title">
                                    Searches ({activeFeature === 'light' ? 'Light interest' : activeFeature === 'cost' ? 'Price checks' : 'Water needs'})
                                </h3>
                                <div className="graph-container">
                                    <svg viewBox="0 0 300 80" className="graph-svg">
                                        <path 
                                            d={graph.path} 
                                            fill="none" 
                                            strokeWidth="2" 
                                            className="graph-path"
                                        />
                                    </svg>
                                    
                                    <div className="graph-badge" style={{ left: graph.badgeLeft }}>
                                        {graph.value}
                                    </div>

                                    <div className="graph-days">
                                        {days.map((day, idx) => (
                                            <span 
                                                key={idx} 
                                                className={idx === graph.activeDayIdx ? 'active-day' : ''}
                                            >
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="details-footer">
                            <button 
                                className="main-add-btn full-width" 
                                onClick={handleAddToCart}
                                disabled={cartCount >= 2}
                                style={cartCount >= 2 ? { 
                                    backgroundColor: '#b3b3b3', 
                                    cursor: 'not-allowed', 
                                    color: '#ffffff',
                                    opacity: 0.8
                                } : {}}
                            >
                                {cartCount >= 2 ? (
                                    <>Košarica je polna <ShoppingCart size={24} /></>
                                ) : (
                                    <>Dodaj v košarico <ShoppingCart size={24} strokeWidth={3} /></>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="infinite-scroll-viewport" ref={scrollRef} onScroll={handleScroll}>
                        <div className="bubble-list">
                            {displayPlants.map((plant, index) => (
                                <div 
                                    key={`${plant._id}-${index}`} 
                                    className="bubble-card"
                                    onClick={() => setSelectedPlant({...plant, clickId: Date.now()})}
                                >
                                    <img 
                                        src={`http://localhost:3001${plant.path}`} 
                                        alt={plant.name} 
                                        className="card-floating-img"
                                    />
                                    <div className="bubble-info">
                                        <h3>{plant.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;