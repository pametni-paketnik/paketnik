import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from 'lucide-react';
import api from './api';
import './index.css';

const ReviewForm = () => {
    const navigate = useNavigate(); 
    const [finalOrder, setFinalOrder] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect (() => {
        const storedOrder = JSON.parse(localStorage.getItem('final_orders')); 
        
        if (!storedOrder) {
            setLoading(false);
            return;
        }
        const imaPlacilo = storedOrder.payment && 
                storedOrder.payment.cardNumber && 
                storedOrder.payment.cardNumber.trim() !== '';

        if (imaPlacilo && !storedOrder.payment?.useProfileCard) {
            setFinalOrder(storedOrder);
            setLoading(false);
        } else{
            api.get('uporabnik/profile') 
                .then(res => {
                    const podatkiUporabnika = res.data; 

                    if(podatkiUporabnika && podatkiUporabnika.stevilka_kartice){
                        const posodobljenoPlacilo = {
                            cardNumber: podatkiUporabnika.stevilka_kartice,
                            cardholder: podatkiUporabnika.ime_na_kartici || `${podatkiUporabnika.ime || ''} ${podatkiUporabnika.priimek || ''}`.trim(),
                            month: podatkiUporabnika.datum_poteka ? podatkiUporabnika.datum_poteka.split('/')[0] : "MM",
                            year: podatkiUporabnika.datum_poteka ? podatkiUporabnika.datum_poteka.split('/')[1] : "YY"
                        };

                    const celotnoNarociloSKartico = {
                        ...storedOrder, 
                        payment: posodobljenoPlacilo
                    }; 
                    setFinalOrder(celotnoNarociloSKartico); 
                } else{
                    setFinalOrder(storedOrder); 
                }
            })
            .catch(err=> {
                setFinalOrder(storedOrder); 
            })
            .finally(() => {
                setLoading(false); 
            });
        }
    }, []);     

    const handleConfirmOrder = async () => {
        if(!finalOrder){
            alert("Podatki o naročilu še niso naloženi"); 
            return; 
        }

        try{
            const trenutniUporabnikId = localStorage.getItem('user_id') || null;

            const podatkiZaBackend = {
                ...trenutniUporabnikId, 
                stranka: {
                    ime: finalOrder.customer?.firstName, 
                    priimek: finalOrder.customer?.lastName, 
                    email: finalOrder.customer?.email, 
                    telefon: finalOrder.customer?.telefon
                }, 
                izdelki: finalOrder.items?.map(item => ({
                    izdelek_id: item._id, 
                    ime_izdelka: item.name || "Roža", 
                    kolicina: item.kolicina || 1, 
                    paketnik: {
                        paketnik_id: item.selectedLocker?._id || null,
                        ime: item.selectedLocker?.name || "Glavni Paketnik",
                        naslov: item.selectedLocker?.address || "Naslov paketnika ni izbran"
                    }
                })), 
                placilo: {
                    imetnik: finalOrder.payment?.cardholder || "Neznan",
                    kartica_maskirana: finalOrder.payment?.cardNumber ? `•••• •••• •••• ${finalOrder.payment.cardNumber.replace(/\s/g, '').slice(-4)}` : "••••",
                    potek: `${finalOrder.payment?.month}/${finalOrder.payment?.year}`
                },
                skupna_cena: Number(finalOrder.totalPrice)
            };

            const response = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(podatkiZaBackend)
        }); 

        if(!response.ok){
            throw new Error("Nekaj je šlo narobe pri shranjevanju naročil v bazo"); 
        }
        const data = await response.json(); 
        const uspesnoNarociloStanje = finalOrder;

        localStorage.removeItem('cart'); 
        localStorage.removeItem('final_orders'); 
        
        navigate('/success', { state: { order: uspesnoNarociloStanje } });

        } catch(error) {
            console.error("Napaka: ", error); 
            alert("Prišlo je do napake pri oddaji naročila.");
        }
    }; 

    if (loading || !finalOrder) {
        return <div className="empty-cart">Nalagam podatke o naročilu...</div>;
    }

    const surovoStevilo = finalOrder.payment?.cardNumber ? String(finalOrder.payment.cardNumber).replace(/\s/g, '') : "";
    const maskedCardNumber = surovoStevilo.includes("•")
        ? surovoStevilo 
        : surovoStevilo
            ? `•••• •••• •••• ${surovoStevilo.slice(-4)}` 
            : "•••• •••• •••• ••••";

    const displayMonth = finalOrder.payment?.month ? String(finalOrder.payment.month).padStart(2, '0') : "MM";
    
    let displayYear = "YY";
    if (finalOrder.payment?.year) {
        const letoStr = String(finalOrder.payment.year);
        displayYear = letoStr.length > 2 ? letoStr.slice(-2) : letoStr.padStart(2, '0');
    }
    
    const imeZaPrikazNaKartici = (finalOrder.payment?.cardholder && finalOrder.payment.cardholder.trim() !== "")
        ? finalOrder.payment.cardholder.toUpperCase()
        : `${finalOrder.customer?.firstName || ''} ${finalOrder.customer?.lastName || ''}`.trim() !== ""
            ? `${finalOrder.customer?.firstName || ''} ${finalOrder.customer?.lastName || ''}`.trim().toUpperCase()
            : "IME IN PRIIMEK";
    
            
    return (
        <div className="checkout-page-review">
            <div className="checkout-main-wrapper-review">
                
                <div className="checkout-preview-review">
                    <div className="checkout-summary-sticky">
                        <h2 className="summary-title">Izbrane rože ({finalOrder.items?.length || 0})</h2>
                        
                        <div className="cart-items-list">
                        {finalOrder.items && finalOrder.items.map((item, index) => (
                            <div key={`cart-item-${item._id}-${index}`} className="cart-item-row-custom">
                                <div className="item-img-container-custom">
                                        <img src={`http://localhost:3001${item.path}`} alt={item.name} />
                                    </div>
                                    <div className="item-details-custom">
                                        <div className="item-header-custom">
                                            <h3>{item.name ? item.name.toUpperCase() : "ROŽA"}</h3>
                                            <span className="item-price-custom">{(Number(item.price) || 0).toFixed(2)} €</span>
                                        </div>
                                        <p className="item-meta-custom">Količina: {item.kolicina || 1}</p>
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
                                <span>{(Number(finalOrder.totalPrice) || 0).toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-details-review">
                    <span className="checkout-step-label-review">KORAK 3 OD 3</span>
                    <h1 className="checkout-product-name-review">PREGLED NAROČILA</h1>
                    <p className="checkout-description-review">Prosimo, preverite pravilnost vaših podatkov pred potrditvijo naročila.</p>

                    <div className="review-sections-wrapper">
                        
                        <h3 className="checkout-section-title-review">1. VAŠI PODATKI</h3>
                        <div className="review-data-box">
                            <div className="input-group-static">
                                <label>Ime in priimek</label>
                                <p>{finalOrder.customer?.firstName} {finalOrder.customer?.lastName}</p>
                            </div>
                            <div className="input-group-static">
                                <label>E-pošta</label>
                                <p>{finalOrder.customer?.email}</p>
                            </div>
                            <div className="input-group-static">
                                <label>Telefon</label>
                                <p>{finalOrder.customer?.telefon || finalOrder.customer?.phone}</p>
                            </div>
                        </div>

                        <h3 className="checkout-section-title-review">2. PREVZEMNA MESTA ROŽ</h3>
                            <div className="review-data-box">
                                {finalOrder.items && finalOrder.items.map((item, idx) => (
                                    <div key={`locker-item-${item._id}-${idx}`} className="locker-review-item">
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
                                            <span className="value">{imeZaPrikazNaKartici}</span>
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