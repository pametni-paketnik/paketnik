import React, { useState, useEffect, useContext } from "react";
import { UserContext } from './userContext';
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart } from 'lucide-react';
import PaymentForm from "./Payment";
import PaketnikMap from './PaketnikMap'; 
import DodajPaketnik from './DodajPaketnik';
import paketnikImg from './images/pametni_paketnik_open.png';
import './index.css';

const OrderForm = () =>{
    const { user } = useContext(UserContext); 
    const navigate = useNavigate(); 

    const [cart, setCart] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [processedOrders, setProcessedOrders] = useState([]);
    const [selectedLocker, setSelectedLocker] = useState(null);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        setCart(storedCart.slice(0, 2)); 
    }, []); 

    const currentProduct = cart[currentIndex]; 

    const handleNextProduct = () => {
        const newOrderEntry = {
            ...currentProduct, 
            locker: selectedLocker
        }; 

        const updatedProcessed = [...processedOrders, newOrderEntry];
        setProcessedOrders(updatedProcessed);

        if (currentIndex < cart.length -1) {
            setCurrentIndex(prev => prev + 1); 
            setSelectedLocker(null); 
        } else { 
            localStorage.setItem('final_orders', JSON.stringify(updatedProcessed)); 
            navigate('/review'); 
        }
    }; 

    if (cart.length === 0) return <div>Vaša košarica je prazna</div>; 
    if (!currentProduct) return <div>Nalagam...</div>; 

return (
    <div className="checkout-page-custom">
        <div className="checkout-main-wrapper">
            <div className="checkout-preview-area">
                <div className="checkout-visual-box">
                    <img src={paketnikImg} alt="Paketnik" className="checkout-paketnik-img" />
                    <img 
                        key={currentProduct._id} 
                        src={`http://localhost:3001${currentProduct.path}`} 
                        alt={currentProduct.name} 
                        className="checkout-plant-overlay"
                    />
                </div>
            </div>

            <div className="checkout-details-area">
                <div className="checkout-content-scrollable">
                    <div className="checkout-header-info">
                        <span className="checkout-step-label">IZDELEK {currentIndex + 1} OD {cart.length}</span>
                        <h1 className="checkout-product-name">{currentProduct.name.toUpperCase()}</h1>
                        <p className="checkout-product-price">{currentProduct.price}€</p>
                    </div>

                    <p className="checkout-description-text">
                        Ta čudovita rastlina bo osvežila vaš prostor in prinesla naravno energijo v vaš dom.
                    </p>

                    <section className="checkout-form-section">
                        <h3 className="checkout-section-title">1. LOKACIJE NAŠIH PAKETIKOV</h3>
                        <div className="checkout-map-outer-wrapper">
                            <PaketnikMap onSelect={setSelectedLocker} user={user} selectedLocker={selectedLocker} />
                        </div>
                    </section>

                    <section className="checkout-form-section">
                        <h3 className="checkout-section-title">2. NAČIN PLAČILA</h3>
                        <PaymentForm hideButtons={true} />
                    </section>

                    <div className="checkout-footer-action">
                        <button 
                            className="checkout-submit-btn" 
                            disabled={!selectedLocker}
                            onClick={handleNextProduct}
                        >
                            <span>
                                {currentIndex < cart.length - 1 ? "NASLEDNJA RASTLINA" : "PREGLEJ NAROČILO"}
                            </span>
                            <ShoppingCart size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default OrderForm;