import React, { useContext, useState, useEffect, useRef } from 'react';
import api from './api';
import { ArrowLeft, ShoppingCart, Trash, Heart, ArrowRight, Bold } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserContext } from './userContext'
import './index.css';
import paketnikImg from './images/pametni_paketnik_open.png';

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
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        setCartCount(currentCart.length);
    }, []);

    const multiplyFactor = plants.length > 0 && plants.length < 6 ? 6 : 3;
    const displayPlants = !isMobile && plants.length > 0 
        ? Array(multiplyFactor).fill(plants).flat() 
        : plants;

    useEffect(() => {
        if (plants.length > 0 && scrollRef.current && !selectedPlant) {
            const container = scrollRef.current;
            
            if (window.innerWidth > 768) {
                requestAnimationFrame(() => {
                    const singleSetHeight = container.scrollHeight / multiplyFactor;
                    container.scrollTop = singleSetHeight * 2;
                })
            }
        }
    }, [plants.length, selectedPlant]);

    const navigate = useNavigate(); 

    const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (currentCart.length >= 2) {
        alert("Naročilo je omejeno na največ 2 roži naenkrat. Prosim dokončajte svoje naročilo");
        return;
    }

    const updatedCart = [...currentCart, selectedPlant];
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        setCartCount(updatedCart.length);
        alert(`${selectedPlant.name} dodana v košarico!`);
        setSelectedPlant(null);

        requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = 0;
            }
        });
    };

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
        if (!container || isMobile || plants.length === 0) return;

        const currentScroll = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        
        const singleSetHeight = scrollHeight / multiplyFactor;

        if (currentScroll + viewportHeight >= scrollHeight - singleSetHeight) {
            const overflow = currentScroll % singleSetHeight;
            container.scrollTop = singleSetHeight + overflow;
        } 
        else if (currentScroll <= 20) {
            container.scrollTop = currentScroll + singleSetHeight;
        }
    };

    useEffect(() => {
        if (plants.length > 0 && scrollRef.current && !selectedPlant) {
            const container = scrollRef.current;
            
            if (window.innerWidth > 768) {
                const multiplyFactor = plants.length < 10 ? 6 : 3;
                requestAnimationFrame(() => {
                    container.scrollTop = (container.scrollHeight / multiplyFactor) * 2;
                });
            }
        }
        if (selectedPlant) {
            setActiveFeature('water'); 

            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
            setCartCount(currentCart.length); 

            requestAnimationFrame(() => {
                if (detailsRef.current) {
                    detailsRef.current.scrollTop = 0;
                }
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }, [plants.length, selectedPlant]);
    
    const isAdmin = user && user.vloga === 'admin'; 

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
                        <div className="details-container">
                            <h2 className="details-title">{selectedPlant.name}</h2>
                            <p className="details-price">{selectedPlant.price}€</p>
                            <p className="details-description">
                                {selectedPlant.opis || "Ta čudovita rastlina bo osvežila vaš prostor in prinesla naravno energijo v vaš dom."}
                            </p>
                        </div>

                        <div className="details-footer">
                            <button className="main-add-btn full-width">
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