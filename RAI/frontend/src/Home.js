import React, { useContext } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
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

    const plants = [
        {id: 1, name: "Bonsai Bot", img: plant1, price: "$59.99"},
        {id: 2, name: "Bonsai Bot", img: plant2, price: "$59.99"},
        {id: 3, name: "Bonsai Bot", img: plant3, price: "$59.99"},
        {id: 4, name: "Bonsai Bot", img: plant4, price: "$59.99"}, 
        {id: 5, name: "Bonsai Bot", img: plant5, price: "$59.99"},
        {id: 6, name: "Bonsai Bot", img: plant6, price: "$59.99"},
        {id: 7, name: "Bonsai Bot", img: plant7, price: "$59.99"},
        {id: 8, name: "Bonsai Bot", img: plant8, price: "$59.99"}
    ];

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
                {plants.map((plant) => (
                    <div key={plant.id} className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant.img} alt={plant.name} />
                        <div className="product-info">
                            <h3>{plant.name}</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            <div className="price-row">
                                <span className="price-dark">{plant.price}</span>
                                
                                {user && (
                                    <button className="add-to-cart-btn">Add to Cart</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default Home;