import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from 'lucide-react';
import './index.css';

const ReviewForm = () => {
    const navigate = useNavigate(); 
    const [finalOrder, setFinalOrder] = useState(null); 

    useEffect (() => {
        const storedOrder = JSON.parse(localStorage.getItem('final_orders')); 
        if(storedOrder) {
            setFinalOrder(storedOrder); 
        }
    }, []); 

    const handleConfirmOrder = async () => {
        try{
            alert("Naročilo uspešno oddano"); 
            localStorage.removeItem('cart'); 
            localStorage.removeItem('final_orders'); 
            navigate('/success'); 
        } catch(error) {
            console.error("Napaka: ", error); 
        }
    }; 

    if(!finalOrder) return <div className="empty-cart">Nalagam podatke o naročilu...</div>

    const {customer, items, locker, payment, totalPrice} = finalOrder; 
    const maskedCardNumber = payment?.cardNumber 
        ? `•••• •••• •••• ${payment.cardNumber.slice(-4)}` 
        : "Ni podatka o kartici";

    return (
        <div className="checkout-container">
            <div className="checkout-left">
                <h1 className="checkout-main-title">PREGLED NAROČILA</h1>

                <div className="review-sections-wrapper">
                    <section className="form-section review-box">
                        <h2>1. Vaši podatki</h2>
                        <div className="review-data-grid">
                            <p><strong>Ime in priimek:</strong> {customer?.firstName} {customer?.lastName}</p>
                            <p><strong>E-pošta:</strong> {customer?.email}</p>
                            <p><strong>Telefon:</strong> {customer?.phone}</p>
                        </div>
                    </section>

                    <section className="form-section review-box">
                        <h2>2. Prevzemna mesta rož</h2>
                        {items && items.map((item, idx) => (
                            <div key={idx} className="selected-locker-display" style={{ marginBottom: '10px' }}>
                                <div className="locker-info-icon">📍</div>
                                <div>
                                    <h3>{item.name} → {item.selectedLocker?.name || "Glavni Paketnik"}</h3>
                                    <p>{item.selectedLocker?.address || "Naslov paketnika ni izbran"}</p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="form-section review-box">
                        <h2>3. Plačilo</h2>
                        <div className="payment-review-method" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span className="credit-card-icon" style={{ fontSize: '2rem' }}>💳</span>
                            <div>
                                <p style={{ margin: 0 }}><strong>Imetnik:</strong> {payment?.cardholder || "Ni podatka"}</p>
                                <p style={{ margin: '4px 0 0 0', color: '#555' }}><strong>Številka:</strong> {maskedCardNumber}</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#777' }}>
                                    <strong>Potek:</strong> {payment?.month || "MM"}/{payment?.year?.toString().slice(-2) || "YY"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <button onClick={handleConfirmOrder} className="pay-btn">
                        POTRDI IN ODDAJ NAROČILO
                    </button>
                    
                    <button onClick={() => navigate(-1)} className="back-edit-btn">
                        ← Popravi podatke
                    </button>
                </div>
            </div>

            <div className="checkout-right-summary">
                <h2 className="summary-title">Izbrane rože ({items?.length || 0})</h2>
                
                <div className="cart-items-list">
                    {items && items.slice(0, 2).map((item, index) => (
                        <div key={item._id || index} className="cart-item-row">
                            <div className="item-img-container">
                                <img src={`http://localhost:3001${item.path}`} alt={item.name} />
                            </div>
                            <div className="item-details">
                                <div className="item-header">
                                    <h3>{item.name.toUpperCase()}</h3>
                                    {/* DODANO: Pretvorba v Number zaradi preprečevanja napak */}
                                    <span className="item-price">{(Number(item.price) || 0).toFixed(2)} €</span>
                                </div>
                                <p className="item-meta">Količina: 1</p>
                                <p className="item-subtext">Paketnik: {item.selectedLocker?.name || "Prevzemno mesto"}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="price-breakdown">
                    <div className="breakdown-row">
                        <span>Dostava v paketnik</span>
                        <span className="free-text">Brezplačno</span>
                    </div>
                    <hr className="divider" />
                    <div className="breakdown-row total-row">
                        <span>Skupaj za plačilo:</span>
                        <span>{(Number(totalPrice) || 0).toFixed(2)} €</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewForm;