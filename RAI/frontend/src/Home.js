import React, { useContext, useState, useEffect } from 'react';
import api from './api';
import { ArrowRight, Heart, Trash} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserContext } from './userContext'
import './index.css';
import heroImg from './images/monstera.png'; 
import plant1 from './images_no_background/coffee.png';
import plant2 from './images_no_background/bonsai_japanese_cherry.png'; 
import plant3 from './images_no_background/chinese_money_plant.png';   
import plant4 from './images_no_background/peace_lily.png'; 
import plant5 from './images_no_background/parlor_palm.png'; 
import plant6 from './images_no_background/sunflowers.png'; 
import plant7 from './images_no_background/peperomia.png'; 
import plant8 from './images_no_background/roses.png'; 

function Home() {
    const { user } = useContext(UserContext); 

    const [plants, setPlants] = useState([
        {id: 1, name: "Bonsai Bot", img: plant1, price: "$59.99"},
        {id: 2, name: "Bonsai Bot", img: plant2, price: "$59.99"},
        {id: 3, name: "Bonsai Bot", img: plant3, price: "$59.99"},
        {id: 4, name: "Bonsai Bot", img: plant4, price: "$59.99"}, 
        {id: 5, name: "Bonsai Bot", img: plant5, price: "$59.99"},
        {id: 6, name: "Bonsai Bot", img: plant6, price: "$59.99"},
        {id: 7, name: "Bonsai Bot", img: plant7, price: "$59.99"},
        {id: 8, name: "Bonsai Bot", img: plant8, price: "$59.99"}
    ]);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get('/plant'); 

                if (res.data && res.data.length > 0) {
                    const updatedPlants = plants.map(p => {
                        const dbPlant = res.data.find(db => db.id === p.id);
                        return dbPlant ? { ...p, naZalogi: dbPlant.naZalogi } : p;
                    });
                    setPlants(updatedPlants);
                }
                
            } catch (err) {
                console.error("Napaka pri pridobivanju rastlin", err);
            }
        };
        fetchPlants();
    }, []);

    const [outOfStock, setOutOfStock] = useState([]); 

    const toggleStock = async (id, currentState) => {
        try{
            await api.put(`/plant/${id}`, {
                naZalogi: !currentState
            }, { withCredentials: true }); 

            window.location.reload(); 
        }catch(err){
            alert("Napak pri posodabljanu zaloge"); 
        }
    }; 

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
                        <div key={plant.id} className="product-card">
                            {isAdmin ? (
                                <Trash size={24} className='heart-icon' />
                            ) : (
                                <Heart size={24} className="heart-icon" /> 
                            )}
                        
                            <img 
                            src={plant.img} 
                            alt={plant.name} 
                            className={isOutOfStock ? "out-of-stock-img" : ""} />
                            
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
                                                    onClick={() => toggleStock(plant._id || plant.id, plant.naZalogi)}
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