import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
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
                    <Link to="/register">
                        <button className="submit-btn-white uppercase-text">
                            Ustvari račun <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </section>

            <section className="product-grid">
                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant1} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant2} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant3} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant4} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant5} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant6} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant7} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

                    <div className="product-card">
                        <Heart size={24} className="heart-icon" />
                        <img src={plant8} alt="Plant" />
                        <div className="product-info">
                            <h3>Bonsai Bot</h3>
                            <p className="description">Lorem ipsum is simply dummy text.</p>
                            
                            {/* Ta del mora biti v vseh karticah enak */}
                            <div className="price-row">
                                <span className="price-dark">$59.99</span>
                                <button className="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>

            </section>
        </div>
    );
}

export default Home;