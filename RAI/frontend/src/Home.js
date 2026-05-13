import React, { useContext, useState, useEffect, useRef } from 'react';
import api from './api';
import { ArrowLeft, ShoppingCart, Trash, Heart, ArrowRight, Bold } from 'lucide-react';
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
    }, [plants.length, selectedPlant]);

    const navigate = useNavigate(); 
    const handleAddToCart = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        localStorage.setItem('cart', JSON.stringify([...currentCart, selectedPlant])); 
        alert(`${selectedPlant.name} dodana v košarico!`);

        navigate('/'); 
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
                        <div className="details-container">
                            <h2 className="details-title">{selectedPlant.name}</h2>
                            <p className="details-price">{selectedPlant.price}€</p>
                            <p className="details-description">
                                {selectedPlant.opis || "Ta čudovita rastlina bo osvežila vaš prostor in prinesla naravno energijo v vaš dom."}
                            </p>
                        </div>

                        <div className="details-footer">
                            <button className="main-add-btn full-width" onClick={handleAddToCart}>
                                Dodaj v košarico <ShoppingCart size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="infinite-scroll-viewport" 
                        ref={scrollRef} 
                        onScroll={handleScroll}
                    >
                        <div className="bubble-list">
                            {displayPlants.map((plant, index) => (
                                <div 
                                    key={`${plant._id}-${index}`} 
                                    className="bubble-card"
                                    onClick={() => setSelectedPlant({...plant, clickId: Date.now()})}>
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