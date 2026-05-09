import React, { useContext, useState, useEffect } from 'react';
import api from './api';
import { ArrowRight, Heart, Trash} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserContext } from './userContext'
import './index.css';
import heroImg from './images/monstera.png';

function Home() {
    const { user } = useContext(UserContext); 
    const [plants, setPlants] = useState([]); 

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get('/plant'); 
                setPlants(res.data);
            } catch (err) {
                console.error("Napaka pri pridobivanju rastlin", err);
            }
        };
        fetchPlants();
    }, []);

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

    const isAdmin = user && user.vloga === 'admin'; 
    
    return (
        <div className="home-container">
            <section 
                className="hero-section-bg" 
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.25)), url(${heroImg})` 
                }}>
                <div className="hero-content-centered">
                    <h1 className="hero-title-white uppercase-text">
                        Vaš digitalni <br /> 
                        <span>vrt rastlin</span>
                    </h1>
                    <p className="hero-p-white">
                        Preprost dostop do upravljanja vaših rastlin in pregled nad ponudbo.
                    </p>

                    {!user && (
                        <Link to="/register">
                            <button className="submit-btn-white uppercase-text">
                                Ustvari račun <ArrowRight size={18} />
                            </button>
                        </Link>
                    )}
                </div>
            </section>

            <section className="product-grid">
                {plants.map((plant) => {
                    const isOutOfStock = plant.naZalogi === false; 
                    return (
                        <div key={plant._id} className="product-card">
                            {isAdmin ? (
                                <Trash size={24} className='heart-icon' onClick={() => deletePlant(plant._id)} />
                            ) : (
                                <Heart size={24} className="heart-icon" /> 
                            )}
                        
                            <img 
                                src={`http://localhost:3001${plant.path}`} 
                                alt={plant.name} 
                                className={isOutOfStock ? "out-of-stock-img" : ""} 
                            />
                            
                            {isOutOfStock && (
                                <div className="out-of-stock-overlay">
                                    OUT OF STOCK
                                </div>
                            )}
                        
                            <div className="product-info">
                                <h3>{plant.name}</h3>
                                    <p className="description">Lorem ipsum is simply dummy text.</p>                
                                    <div className="price-row">
                                        <span className="price-dark">{plant.price}</span>
                                        
                                        {user && (
                                            isAdmin ? (
                                                <button 
                                                    className={`add-to-cart-btn ${isOutOfStock ? "btn-red" : ""}`}
                                                    onClick={() => toggleStock(plant._id, plant.naZalogi)}
                                                    style={{ backgroundColor: isOutOfStock ? '#7f8c8d' : '#6F4E37' }}>
                                                {isOutOfStock ? "Set In Stock" : "Out of Stock"}
                                            </button>
                                            ) : (
                                                <button 
                                                className="add-to-cart-btn" 
                                                disabled={isOutOfStock}
                                                style={{ opacity: isOutOfStock ? 0.5 : 1 }}>
                                                {isOutOfStock ? "Unavailable" : "Add to Cart"}
                                            </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        ); 
                    })}
                </section>
            </div>
    ); 
}

export default Home;