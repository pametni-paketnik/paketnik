import React from 'react';
import { ArrowRight, Leaf, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './index.css';

function Home() {
    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-text">
                    <span className="category-tag uppercase-text">#INPLANT_EKOSISTEM</span>
                    <h1 className="uppercase-text">Vaš digitalni <br /> vrt rastlin</h1>
                    <p>Preprost dostop do upravljanja vaših rastlin in pregled nad ponudbo. Vse na enem mestu, varno in hitro.</p>
                    <div className="hero-buttons">
                        <Link to="/register">
                            <button className="submit-btn uppercase-text">
                                Ustvari račun <ArrowRight size={18} />
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="hero-visual-placeholder">
                    {/* Namesto slike imamo zdaj stiliziran krog z ikono */}
                    <div className="main-circle">
                        <Leaf size={100} color="#6F4E37" />
                    </div>
                </div>
            </section>

            {/* Hitre info kartice */}
            <section className="info-grid">
                <div className="info-card">
                    <Package size={30} />
                    <h3 className="uppercase-text">Naročila</h3>
                    <p>Spremljajte svoja naročila v realnem času.</p>
                </div>
                <div className="info-card highlight">
                    <Star size={30} />
                    <h3 className="uppercase-text">Premium</h3>
                    <p>Ekskluziven dostop do redkih vrst rastlin.</p>
                </div>
                <div className="info-card">
                    <User size={30} />
                    <h3 className="uppercase-text">Profil</h3>
                    <p>Urejajte svoje podatke in nastavitve.</p>
                </div>
            </section>
        </div>
    );
}

const User = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default Home;