import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from 'lucide-react';
import api from './api';
import './index.css';
<<<<<<< Updated upstream
import './index-dark.css';
import jsPDF from "jspdf";

const formatPhone = (value) => {
    if (!value || value === "/") return "/";
    const cleaned = String(value).replace(/\D/g, "").slice(0, 9);
    if (!cleaned) return "/";
    return cleaned.match(/.{1,3}/g)?.join(' ') || "/";
};
=======
import jsPDF from "jspdf";
>>>>>>> Stashed changes

const ReviewForm = () => {
    const navigate = useNavigate(); 
    const [finalOrder, setFinalOrder] = useState(null); 
    const [loading, setLoading] = useState(true);


    useEffect (() => {
        const storedOrder = JSON.parse(localStorage.getItem('final_orders')); 

        console.log("RAW storedOrder:", storedOrder);
        
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
                        customer: {
                            ...storedOrder.customer,
                            ime: storedOrder.customer?.ime || storedOrder.customer?.firstName || podatkiUporabnika.ime || "",
                            priimek: storedOrder.customer?.priimek || storedOrder.customer?.lastName || podatkiUporabnika.priimek || "",
                            email: storedOrder.customer?.email || podatkiUporabnika.email || "",
                            telefonska_stevilka: (storedOrder.customer?.phone && storedOrder.customer.phone !== "/") 
                                ? storedOrder.customer.phone 
                                : (storedOrder.customer?.telefonska_stevilka && storedOrder.customer.telefonska_stevilka !== "/") 
                                    ? storedOrder.customer.telefonska_stevilka 
                                    : (podatkiUporabnika.telefonska_stevilka || "")
                        },
                        payment: posodobljenoPlacilo
                    }; 
                    setFinalOrder(celotnoNarociloSKartico); 
                } else{
                    setFinalOrder(storedOrder); 
                }
            })
            .catch(err=> {
                setFinalOrder(storedOrder); 
                localStorage.setItem('final_orders', JSON.stringify(storedOrder)); 
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
            const storedUserStr = localStorage.getItem('user');
            let trenutniUporabnikId = null;
            if (storedUserStr) {
                try {
                    const parsed = JSON.parse(storedUserStr);
                    trenutniUporabnikId = parsed._id || parsed.id || null;
                } catch(e) {}
            }

            if (!trenutniUporabnikId) {
                alert("Za oddajo naročila se morate prijaviti.");
                navigate('/login');
                return;
            }

            const podatkiZaBackend = {
                uporabnik_id: trenutniUporabnikId, 
                stranka: {
                    ime: finalOrder.customer?.firstName || finalOrder.customer?.ime || "", 
                    priimek: finalOrder.customer?.lastName || finalOrder.customer?.priimek || "", 
                    email: finalOrder.customer?.email, 
                    telefonska_stevilka: (finalOrder.customer?.phone && finalOrder.customer.phone !== "/") 
                        ? finalOrder.customer.phone 
                        : (finalOrder.customer?.telefonska_stevilka && finalOrder.customer.telefonska_stevilka !== "/") 
                            ? finalOrder.customer.telefonska_stevilka 
                            : ""
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

            const response = await api.post('/narocilo', podatkiZaBackend); 
            const data = response.data;

            const orderId = data._id || data.id;
            generateOrderPdf(podatkiZaBackend, orderId);

            localStorage.removeItem('cart'); 
            localStorage.removeItem('final_orders'); 

            alert('Naročilo je bilo uspešno oddano!');
            navigate('/');
        } catch(error) {
            console.error("Napaka: ", error); 
            alert("Prišlo je do napake pri oddaji naročila.");
        }
    }; 

    const generateOrderPdf = (narocilo, orderId) => {
        const doc = new jsPDF();

        const stranka = narocilo.stranka || {};
        const izdelki = narocilo.izdelki || [];
        const placilo = narocilo.placilo || {};

        let y = 20;

        doc.setFontSize(18);
        doc.text("Potrdilo o narocilu", 14, y);

        y += 12;
        doc.setFontSize(11);
        doc.text(`Stevilka narocila: ${orderId || "-"}`, 14, y);

        y += 8;
        doc.text(`Datum: ${new Date().toLocaleDateString("sl-SI")}`, 14, y);

        y += 14;
        doc.setFontSize(14);
        doc.text("Podatki stranke", 14, y);

        y += 8;
        doc.setFontSize(11);
        doc.text(`Ime: ${stranka.ime || ""}`, 14, y);
        y += 7;
        doc.text(`Priimek: ${stranka.priimek || ""}`, 14, y);
        y += 7;
        doc.text(`E-mail: ${stranka.email || ""}`, 14, y);
        y += 7;
<<<<<<< Updated upstream
        const formattedPdfPhone = formatPhone(stranka.telefonska_stevilka);
        doc.text(`Telefon: ${formattedPdfPhone === "/" ? "" : formattedPdfPhone}`, 14, y);
=======
        doc.text(`Telefon: ${stranka.telefon || ""}`, 14, y);
>>>>>>> Stashed changes

        y += 14;
        doc.setFontSize(14);
        doc.text("Izdelki", 14, y);

        y += 8;
        doc.setFontSize(11);

        izdelki.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.ime_izdelka || "Izdelek"}`, 14, y);
            y += 7;
            doc.text(`Kolicina: ${item.kolicina || 1}`, 20, y);
            y += 7;
            doc.text(`Paketnik: ${item.paketnik?.ime || "Glavni Paketnik"}`, 20, y);
            y += 7;
            doc.text(`Naslov paketnika: ${item.paketnik?.naslov || "Naslov ni izbran"}`, 20, y);
            y += 10;
        });

        y += 4;
        doc.setFontSize(14);
        doc.text("Placilo", 14, y);

        y += 8;
        doc.setFontSize(11);
        doc.text(`Imetnik kartice: ${placilo.imetnik || ""}`, 14, y);
        y += 7;
        doc.text(`Kartica: ${placilo.kartica_maskirana || ""}`, 14, y);
        y += 7;
        doc.text(`Potek: ${placilo.potek || ""}`, 14, y);

        y += 14;
        doc.setFontSize(14);
        doc.text(`Skupna cena: ${(Number(narocilo.skupna_cena) || 0).toFixed(2)} EUR`, 14, y);

        doc.save(`narocilo-${orderId || Date.now()}.pdf`);
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
        : `${finalOrder.customer?.ime || finalOrder.customer?.firstName || ''} ${finalOrder.customer?.priimek || finalOrder.customer?.lastName || ''}`.trim() !== ""
            ? `${finalOrder.customer?.ime || finalOrder.customer?.firstName || ''} ${finalOrder.customer?.priimek || finalOrder.customer?.lastName || ''}`.trim().toUpperCase()
            : "IME IN PRIIMEK";
            
    return (
        <div className="checkout-page-review">
            <div className="checkout-main-wrapper-review">
                
                <div className="checkout-preview-review">
                    <div className="checkout-summary-sticky">
                        <h2 className="summary-title">Selected plants ({finalOrder.items?.length || 0})</h2>
                        
                        <div className="cart-items-list">
                        {finalOrder.items && finalOrder.items.map((item, index) => (
                            <div key={`cart-item-${item._id}-${index}`} className="cart-item-row-custom">
                                <div className="item-img-container-custom">
                                        <img src={`http://localhost:3001${item.path}`} alt={item.name} />
                                    </div>
                                    <div className="item-details-custom">
                                        <div className="item-header-custom">
                                            <h3>{item.name ? item.name.toUpperCase() : "Plant"}</h3>
                                            <span className="item-price-custom">{(Number(item.price) || 0).toFixed(2)} €</span>
                                        </div>
                                        <p className="item-meta-custom">Quantity: {item.kolicina || 1}</p>
                                        <p className="item-subtext-custom">📍 {item.selectedLocker?.name || "Prevzemno mesto"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="price-breakdown-custom">
                            <div className="breakdown-row-custom">
                                <span>Delivery to parcel box</span>
                                <span className="free-text-custom">Free</span>
                            </div>
                            <hr className="divider-custom" />
                            <div className="breakdown-row-custom total-row-custom">
                                <span>Total for payment:</span>
                                <span>{(Number(finalOrder.totalPrice) || 0).toFixed(2)} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="checkout-details-review">
                    <span className="checkout-step-label-review">STEP 3 OF 3</span>
                    <h1 className="checkout-product-name-review">ORDER REVIEW</h1>
                    <p className="checkout-description-review">Please check the correctness of your information before confirming your order.</p>

                    <div className="review-sections-wrapper">
                        
                        <h3 className="checkout-section-title-review">1. YOUR DATA</h3>
                        <div className="review-data-box">
                            <div className="input-group-static">
                                <label>First and last name</label>
                                <p>
                                   {finalOrder.customer?.ime || finalOrder.customer?.firstName || ""} {finalOrder.customer?.priimek || finalOrder.customer?.lastName || ""}
                                </p>
                            </div>
                            <div className="input-group-static">
                                <label>E-mail</label>
                                <p>{finalOrder.customer?.email}</p>
                            </div>
                            <div className="input-group-static">
                                <label>Phone number</label>
                                <p>
                                    {formatPhone(
                                        (finalOrder.customer?.phone && finalOrder.customer.phone !== "/") 
                                            ? finalOrder.customer.phone 
                                            : finalOrder.customer?.telefonska_stevilka
                                    )}
                                </p>
                            </div>
                        </div>

                        <h3 className="checkout-section-title-review">2. PLANT PICK-UP POINT</h3>
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

                        <h3 className="checkout-section-title-review">3. PAYMENT</h3>
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
                                            <span className="label">FIRST AND NAME</span>
                                            <span className="value">{imeZaPrikazNaKartici}</span>
                                        </div>
                                        <div className="card-info">
                                            <span className="label">EXPIRY</span>
                                            <span className="value">{displayMonth}/{displayYear}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="action-buttons-wrapper">
                            <button onClick={handleConfirmOrder} className="checkout-submit-btn-review">
                                <span>CONFIRM AND SUBMIT ORDER</span>
                            </button>
                            
                            <button onClick={() => navigate(-1)} className="checkout-back-btn">
                                ← Correct order details
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReviewForm;