import React from 'react';
import { ArrowRight, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './index.css';
import heroImg from './images/monstera.png'; // Prepričaj se, da je slika v src/images/

function Home() {
    return (
        <div className="home-container">
            {/* Hero Section kot ozadje */}
            <section 
                className="hero-section-bg" 
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroImg})` 
                }}>
                <div className="hero-content-centered">
                    <h1 className="hero-title-white uppercase-text">
                        Vaš digitalni <br /> 
                        <span className="italic-text">vrt rastlin</span>
                    </h1>
                    <p className="hero-p-white">
                        Preprost dostop do upravljanja vaših rastlin in pregled nad ponudbo. 
                        Vse na enem mestu, varno in hitro.
                    </p>
                    <Link to="/register">
                        <button className="submit-btn-white uppercase-text">
                            Ustvari račun <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}

// Pomožna komponenta za ikono uporabnika (User icon)
const User = ({size, strokeWidth, color}) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color || "currentColor"} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

export default Home;