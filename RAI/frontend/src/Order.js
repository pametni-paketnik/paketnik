import React, { useState, useEffect, useContext } from "react";
import { UserContext } from './userContext';
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart, Trash } from 'lucide-react';
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

    const [orderItems, setOrderItems] = useState([]);
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        setCart(storedCart.slice(0, 1)); 

        const storedFinalOrder = JSON.parse(localStorage.getItem('final_orders'));
        if (storedFinalOrder) {
            if (storedFinalOrder.items && storedFinalOrder.items.length > 0) {
                setProcessedOrders(storedFinalOrder.items);
                    
                    setCurrentIndex(0); 

                    const currentPaketnik = storedFinalOrder.items[0]?.selectedLocker; 
                    if (currentPaketnik && currentPaketnik._id) {
                    setSelectedLocker({
                        _id: currentPaketnik._id,
                        id: currentPaketnik._id,
                        ime: currentPaketnik.name || currentPaketnik.ime,
                        name: currentPaketnik.name || currentPaketnik.ime,
                        lokacija: currentPaketnik.address || currentPaketnik.lokacija,
                        naslov: currentPaketnik.address || currentPaketnik.naslov
                    });
                }
            }
            if(storedFinalOrder.payment) {
                setPaymentData(storedFinalOrder.payment); 
            }
        }
    }, []); 

    useEffect(() => {
        if (processedOrders[currentIndex]) {
            const loker = processedOrders[currentIndex].selectedLocker;
            if (loker && loker._id) {
                setSelectedLocker({
                    _id: loker._id,
                    id: loker._id,
                    ime: loker.name || loker.ime,
                    naslov: loker.address || loker.naslov
                });
                return;
            }
        }
    }, [currentIndex, processedOrders]);

    const currentProduct = cart[currentIndex];

    const handleNextProduct = () => {
        const lockerPayload = {
            _id: selectedLocker?._id || selectedLocker?.id, 
            name: selectedLocker?.ime || selectedLocker?.name || null, 
            address: selectedLocker?.lokacija || selectedLocker?.naslov || selectedLocker?.address || "Naslov ni na voljo"
        }; 

        const newOrderEntry = {
            ...currentProduct, 
            selectedLocker: lockerPayload
        }; 

        const updatedProcessed = [];
        updatedProcessed[0] = newOrderEntry;
        setProcessedOrders(updatedProcessed);

        if (currentIndex < cart.length - 2) {
            setCurrentIndex(prev => prev + 1); 
            setSelectedLocker(null); 
        } else { 
            const total = updatedProcessed.reduce((sum, item) => sum + (Number(item.price) || 0), 0); 

            const finalOrderPayload = {
                customer: {
                    firstName: user?.ime || "Unknown", 
                    lastName: user?.priimek || "Unknown", 
                    email: user?.email || "", 
                    phone: user?.telefonska_stevilka || user?.telefon || "/"
                }, 
                items: updatedProcessed, 
                locker: updatedProcessed[0]?.selectedLocker, 
                payment: paymentData, 
                totalPrice: total
            }; 

            localStorage.setItem('final_orders', JSON.stringify(finalOrderPayload)); 
            navigate('/review'); 
        }
    }; 

    const handleRemoveFromCart = () => {
        const updatedCart = cart.filter((_, index) => index !== currentIndex);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        setCart(updatedCart);

        if (updatedCart.length === 0) {
            navigate('/home');
            return;
        }

        if (currentIndex >= updatedCart.length) {
            setCurrentIndex(updatedCart.length - 1);
        }

        setSelectedLocker(null);

        setProcessedOrders(prev =>
            prev.filter((_, index) => index !== currentIndex)
        );
    };

    if (cart.length === 0) return <div>Your cart is empty</div>; 
    if (!currentProduct) return <div>Loading...</div>; 

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
                    <div className="checkout-header-info" style={{ position: 'relative' }}>
                        <button 
                                className="admin-delete-top-btn" 
                                onClick={handleRemoveFromCart}
                                style={{
                                    position: 'absolute', top: '5px', right: '10px', border: 'none',
                                    background: 'transparent', color: '#ff4d4d', padding: '10px',
                                    width: '90px', cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', gap: '8px', fontWeight: 'bold', transition: '0.3s'
                                }}
                            > 
                                <Trash size={20} />
                            </button>
                        <span className="checkout-step-label">PRODUCT {currentIndex + 1} OF {cart.length}</span>
                        <h1 className="checkout-product-name">{currentProduct.name.toUpperCase()}</h1>
                        <p className="checkout-product-price">{currentProduct.price}€</p>
                    </div>

                    <p className="checkout-description-text">{currentProduct.description}</p>

                    <section className="checkout-form-section">
                        <h3 className="checkout-section-title">1. LOCATIONS OF OUR PACKAGES</h3>
                        <div className="checkout-map-outer-wrapper">
                            <PaketnikMap onSelect={setSelectedLocker} user={user} selectedLocker={selectedLocker} />
                        </div>
                    </section>

                    <section className="checkout-form-section">
                        <h3 className="checkout-section-title">2. PAYMENT METHOD</h3>
                        <PaymentForm onCardDataChange={setPaymentData} initialData={paymentData} />
                    </section>

                    <div className="checkout-footer-action">
                        <button 
                            className="checkout-submit-btn" 
                            disabled={!selectedLocker}
                            onClick={handleNextProduct}
                        >
                            <span>
                                {currentIndex < cart.length - 2 ? "NEXT PLANT" : "VIEW ORDER"}
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