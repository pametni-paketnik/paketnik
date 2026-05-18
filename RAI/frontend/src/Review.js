import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from 'lucide-react';
import './index.css';

const ReviewForm = () => {
    const navigate = useNavigate(); 
    const [finalOrder, setFinalOrder] = useState(null); 

    useEffect (() => {
        const storedOrder = JSON.parse(localStorage.getItem('final_orders')); 
        console.log("Podatki iz localStorage:", storedOrder);
        if(storedOrder) {
            setFinalOrder(storedOrder); 
        }
    }, []); 

    const handleConfirmOrder = async () => {
        try{
            const trenutniUporabnikId = localStorage.getItem('user_id') || null;

            const podatkiZaBackend = {
                ...finalOrder,
                uporabnik_id: trenutniUporabnikId
            };

            const response = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(finalOrder)
        }); 

        if(!response.ok){
            throw new Error("Nekaj je šlo narobe pri shranjevanju naročil v bazo"); 
        }
        const data = await response.json(); 
        console.log("Narocilo uspesno shranjeno"); 

        alert("Naročilo uspešno oddano"); 
        navigate('/success', { state: { order: finalOrder } });

        localStorage.removeItem('cart'); 
        localStorage.removeItem('final_orders'); 
        } catch(error) {
            console.error("Napaka: ", error); 
        }
    }; 

    if(!finalOrder) return <div className="empty-cart">Nalagam podatke o naročilu...</div>

    const {customer, items, locker, payment, totalPrice} = finalOrder; 
    const maskedCardNumber = payment?.cardNumber 
        ? `•••• •••• •••• ${payment.cardNumber.slice(-4)}` 
        : "Ni podatka o kartici";

    const displayMonth = payment?.month ? String(payment.month).padStart(2, '0') : "MM"; 
    const displayYear = payment?.year ? payment.year.toString().slice(-2) : "YY";

    return (
        /* POPRAVLJENO: Razredi se sedaj 100% ujemajo z vašim CSS-om za sivo-belo postavitev */
        <div className="checkout-page-review">
            <div className="checkout-main-wrapper-review">
                
                {/* Levi del - siva podlaga */}
                <div className="checkout-preview-review">
                    <div className="checkout-summary-sticky">
                        <h2 className="summary-title">Izbrane rože ({items?.length || 0})</h2>
                        
                        <div className="cart-items-list">
                            {items && items.map((item, index) => (
                                <div key={item._id || index} className="cart-item-row-custom">
                                    <div className="item-img-container-custom">
                                        <img src={`http://localhost:3001${item.path}`} alt={item.name} />
                                    </div>
                                    <div className="item-details-custom">
                                        <div className="item-header-custom">
                                            <h3>{item.name ? item.name.toUpperCase() : "ROŽA"}</h3>
                                            <span className="item-price-custom">{(Number(item.price) || 0).toFixed(2)} €</span>
                                        </div>
                                        <p className="item-meta-custom">Količina: 1</p>
                                        <p className="item-subtext-custom">📍 {item.selectedLocker?.name || "Prevzemno mesto"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="price-breakdown-custom">
                            <div className="breakdown-row-custom">
                                <span>Dostava v paketnik</span>
                                <span className="free-text-custom">Brezplačno</span>
                            </div>
                            <hr className="divider-custom" />
                            <div className="breakdown-row-custom total-row-custom">
                                <span>Skupaj za plačilo:</span>
                                <span>{(Number(totalPrice) || 0).toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desni del - ČISTO BELO OZADJE + DRSNIK */}
                <div className="checkout-details-review">
                    <span className="checkout-step-label-review">KORAK 3 OD 3</span>
                    <h1 className="checkout-product-name-review">PREGLED NAROČILA</h1>
                    <p className="checkout-description-review">Prosimo, preverite pravilnost vaših podatkov pred potrditvijo naročila.</p>

                    <div className="review-sections-wrapper">
                        
                        <h3 className="checkout-section-title-review">1. VAŠI PODATKI</h3>
                        <div className="review-data-box">
                            <div className="input-group-static">
                                <label>Ime in priimek</label>
                                <p>{customer?.firstName} {customer?.lastName}</p>
                            </div>
                            <div className="input-group-static">
                                <label>E-pošta</label>
                                <p>{customer?.email}</p>
                            </div>
                            <div className="input-group-static">
                                <label>Telefon</label>
                                <p>{customer?.phone}</p>
                            </div>
                        </div>

                        <h3 className="checkout-section-title-review">2. PREVZEMNA MESTA ROŽ</h3>
                        <div className="review-data-box">
                            {items && items.map((item, idx) => (
                                <div key={idx} className="locker-review-item">
                                    <div className="locker-icon-min">📍</div>
                                    <div>
                                        <p className="locker-item-title"><strong>{item.name}</strong> → {item.selectedLocker?.name || "Glavni Paketnik"}</p>
                                        <p className="locker-item-address">{item.selectedLocker?.address || "Naslov paketnika ni izbran"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="checkout-section-title-review">3. PLAČILO</h3>
                        <div className="payment-container-minimal">
                            <div className="card-visual-modern">
                                <div className="card-inner">
                                    <div className="card-top">
                                        <div className="card-chip"></div>
                                        <div className="card-type">VISA</div>
                                    </div>
                                    <div className="card-number-display">
                                        {maskedCardNumber}
                                    </div>
                                    <div className="card-bottom">
                                        <div className="card-info">
                                            <span className="label">Imetnik kartice</span>
                                            <span className="value">{payment?.cardholder || "Ni podatka"}</span>
                                        </div>
                                        <div className="card-info">
                                            <span className="label">Potek</span>
                                            <span className="value">{displayMonth}/{displayYear}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="action-buttons-wrapper">
                            <button onClick={handleConfirmOrder} className="checkout-submit-btn-review">
                                <span>POTRDI IN ODDAJ NAROČILO</span>
                            </button>
                            
                            <button onClick={() => navigate(-1)} className="checkout-back-btn">
                                ← Popravi podatke naročila
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReviewForm;