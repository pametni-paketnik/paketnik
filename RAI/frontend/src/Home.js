import React, { useContext, useState, useEffect, useRef } from 'react';
import api from './api';
import { ArrowLeft, ShoppingCart, Trash, Heart, ArrowRight, Bold, Sun, Droplet, Tag, Cast, Pencil } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserContext } from './userContext'
import './index.css';
import './index-dark.css';
import paketnikImg from './images/pametni_paketnik_open.png';
import axios from 'axios';

function Home({ orderFilter = "oddano" }) {
    const { user } = useContext(UserContext); 
    const [plants, setPlants] = useState([]); 
    const [selectedPlant, setSelectedPlant] = useState(null); 
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeFeature, setActiveFeature] = useState('water'); 
    const [cartCount, setCartCount] = useState(0); 
    const detailsRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const isFlowerShop = user && user.vloga === 'cvetlicarna';

    const [isEditing, setIsEditing] = useState(false);

    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCare, setEditCare] = useState('');

    const ORDER_STATUS = {
        oddano: {
            flower: "New order",
            user: "Order placed"
        },
        v_pripravi: {
            flower: "In preparation",
            user: "In process"
        },
        caka_na_prevzem: {
            flower: "Delivered",
            user: "Ready for pickup"
        },
        prevzeto: {
            flower: "Delivered",
            user: "Delivered"
        },
        aborting: {
            flower: "Cancelled",
            user: "Cancelled"
        }
    };

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await api.get('/plant'); 
                setPlants(res.data);
            } catch (err) {
                console.error("Napaka pri pridobivanju rastlin", err);
            }
        };

        const fetchOrders = async () => {
            try {
                const res = await api.get('/narocilo');
                const currentUserId = user ? (user._id || user.id) : null;
                
                const filteredOrders = res.data.filter((order) => {
                    if (!isFlowerShop) return true;

                    if (orderFilter === 'oddano') {
                        return order.status === 'oddano';
                    }

                    if (orderFilter === 'v_pripravi') {
                        return order.status === 'v_pripravi';
                    }

                    if (orderFilter === 'caka_na_prevzem') {
                        return order.status === 'caka_na_prevzem';
                    }

                    if (orderFilter === 'prevzeto') {
                        return order.status === 'prevzeto';
                    }

                    return false;
                });

                const sortedOrders = [...filteredOrders].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );

                setOrders(sortedOrders);
            } catch (err) {
                console.error("Napaka pri pridobivanju naročil:", err);
            }
        };

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); 
        }; 

        if (isFlowerShop) {
            fetchOrders();
        } else {
            fetchPlants();
        }

        window.addEventListener('resize', handleResize); 

        return () => {
            window.removeEventListener('resize', handleResize); 
        };
    }, [isFlowerShop, orderFilter]);

    useEffect(() => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
        setCartCount(currentCart.length);
    }, []);

    const multiplyFactor = plants.length > 0 && plants.length < 6 ? 6 : 3;
    const displayPlants = !isMobile && plants.length > 0 
        ? Array(multiplyFactor).fill(plants).flat() 
        : plants;

    useEffect(() => {
        if (plants.length > 0 && scrollRef.current && !selectedPlant) {
            const container = scrollRef.current;
            
            if (window.innerWidth > 768) {
                requestAnimationFrame(() => {
                    const singleSetHeight = container.scrollHeight / multiplyFactor;
                    container.scrollTop = singleSetHeight * 2;
                })
            }
        }
        if(selectedPlant){
            setActiveFeature('water'); 

            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
            setCartCount(currentCart.length); 

            requestAnimationFrame(() => {
                if (detailsRef.current) {
                    detailsRef.current.scrollTop = 0;
                }
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }, [plants.length, selectedPlant]);

    const navigate = useNavigate(); 
    const handleAddToCart = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (currentCart.length >= 1) {
            alert("Naročilo je omejeno na največ 2 roži naenkrat. Prosim dokončajte svoje naročilo");
            return;
        }

        const updatedCart = [...currentCart, selectedPlant];
            localStorage.setItem('cart', JSON.stringify(updatedCart));

            setCartCount(updatedCart.length);
            alert(`${selectedPlant.name} dodana v košarico!`);
            setSelectedPlant(null);

            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = 0;
                }
            });
    };

    const handleAcceptOrder = async (order) => {
        const confirmed = window.confirm(
            `Are you sure you want to accept order #${order._id.slice(-6)}?`
        );

        if (!confirmed) return;
        try {
            await api.put(`/narocilo/${order._id}/status`, {
                status: 'v_pripravi',
                cvetlicarna_id: user ? (user._id || user.id) : null
            });

            setOrders((prevOrders) =>
                prevOrders.filter((o) => o._id !== order._id)
            );

            alert('Naročilo je bilo uspešno sprejeto.');
        } catch (err) {
            console.error('Napaka pri sprejemu naročila:', err);
            alert('Prišlo je do napake pri posodabljanju statusa.');
        }
    };
    
    const handleDeliveredOrder = async (order) => {
        const confirmed = window.confirm(
            `Are you sure you want to mark order #${order._id.slice(-6)} as delivered?`
        );

        if (!confirmed) return;
        try {
            const response = await api.put(`/narocilo/${order._id}/status`, {
                status: 'prevzeto'
            });

            console.log("Posodobljeno naročilo:", response.data);

            setOrders((prevOrders) =>
                prevOrders.filter((o) => o._id !== order._id)
            );

            alert('Naročilo je označeno kot dostavljeno.');
        } catch (err) {
            console.error('Napaka pri označevanju dostave:', err);
            alert('Prišlo je do napake pri posodabljanju statusa.');
        }
    };

    const formatDeliveryDate = (value) => {
        if (!value) {
            return "Ni podatka";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
            return "Ni podatka";
        }

        return date.toLocaleDateString('sl-SI');
    };

    const formatDateTime = (value) => {
        if (!value) return "Ni podatka";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "Ni podatka";

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
    };

    const [outOfStock, setOutOfStock] = useState([]); 
    const toggleStock = async (id, currentState) => {
        try {
            const res = await api.put(`/plant/${id}`, {
                naZalogi: !currentState
            }, { withCredentials: true }); 

            setPlants(plants.map(p => p._id === id ? res.data : p)); 
        } catch(err) {
            alert("Napak pri posodabljanu zaloge"); 
        }
    }; 

    const deletePlant = async (id) => {
        if(window.confirm("Ali si prepričan da želiš izbrisati to rastlino?")) {
            try{
                await api.delete(`/plant/${id}`, { withCredentials: true }); 
                setPlants(plants.filter(p => p._id !== id)); 

                setSelectedPlant(null);
                
                navigate('/');
            } catch(err) {
                alert("Napaka pri brisanju"); 
            }
        }
    }

    const updatePlant = async (id) => {
        try {
            const updatedData = {
                name: editName,
                price: editPrice,
                description: editDescription,
                care: editCare
            };

            const res = await api.put(`/plant/${id}`, updatedData, {
                withCredentials: true
            });

            setPlants(plants.map(p => 
                p._id === id ? res.data : p
            ));

            setSelectedPlant(res.data);

            setIsEditing(false);

            alert("Rastlina uspešno posodobljena!");
        } catch(err) {
            console.error(err);
            alert("Napaka pri posodabljanju");
        }
    };

    const scrollRef = useRef(null);
    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container || isMobile || plants.length === 0) return;

        const currentScroll = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        
        const singleSetHeight = scrollHeight / multiplyFactor;

        if (currentScroll + viewportHeight >= scrollHeight - singleSetHeight) {
            const overflow = currentScroll % singleSetHeight;
            container.scrollTop = singleSetHeight + overflow;
        } 
        else if (currentScroll <= 20) {
            container.scrollTop = currentScroll + singleSetHeight;
        }
    };

    useEffect(() => {
        if (plants.length > 0 && scrollRef.current && !selectedPlant) {
            const container = scrollRef.current;
            
            if (window.innerWidth > 768) {
                const multiplyFactor = plants.length < 10 ? 6 : 3;
                requestAnimationFrame(() => {
                    container.scrollTop = (container.scrollHeight / multiplyFactor) * 2;
                });
            }
        }
        if (selectedPlant) {
            setActiveFeature('water'); 

            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]'); 
            setCartCount(currentCart.length); 

            requestAnimationFrame(() => {
                if (detailsRef.current) {
                    detailsRef.current.scrollTop = 0;
                }
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }, [plants.length, selectedPlant]);
    
    const isAdmin = user && user.vloga === 'admin'; 

  const getGraphData = () => {
    switch (activeFeature) {
        case 'light':
            return {
                value: selectedPlant?.iskanja_light || 140,
                path: "M 0,50 C 20,50 30,15 50,15 C 70,15 80,65 100,65 C 130,65 140,35 170,35 C 200,35 220,55 250,55 C 270,55 285,40 300,40",
                activeDayIdx: 1, 
                badgeLeft: '17%'
            };
        case 'cost':
            return {
                value: selectedPlant?.iskanja_cost || 85,
                path: "M 0,35 C 30,35 45,60 75,60 C 105,60 120,40 150,40 C 180,40 200,60 220,60 C 240,60 245,15 265,15 C 285,15 290,45 300,45",
                activeDayIdx: 5, 
                badgeLeft: '84%'
            };
        case 'water':
        default:
            return {
                value: selectedPlant?.iskanja_water || 215,
                path: "M 0,40 C 15,15 30,15 45,50 C 60,80 85,35 110,35 C 130,35 135,55 155,55 C 175,55 190,20 215,20 C 240,20 250,45 270,45 C 285,45 292,25 300,25",
                activeDayIdx: 3, 
                badgeLeft: '49%'
            };
        }
    };

    const graph = getGraphData(); 
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; 

    if (isFlowerShop) {
        const pageTitle =
            orderFilter === 'oddano'
                ? 'NEW ORDERS'
                : orderFilter === 'v_pripravi'
                ? 'IN PREPARATION'
                : orderFilter === 'caka_na_prevzem'
                ? 'READY FOR PICKUP'
                : 'ACCEPTED ORDERS';
        return (
            <div className="flower-orders-page">
                <div className="flower-orders-wrapper">
                    <div className="flower-orders-header">
                        <h1 className="flower-orders-title">{pageTitle}</h1>
                    </div>

                    {orders.length === 0 ? (
                        <div className="flower-orders-empty">
                            There are currently no orders here.
                        </div>
                    ) : (
                        
                        <div className="flower-orders-grid">
                            {orders.map((order) => (
                                <div>
                                    <div key={order._id} className="flower-order-card">
                                        <div className="flower-order-card-header">
                                            <span className="flower-order-badge">
                                                #{order._id.slice(-6)}
                                            </span>
                                            <span className="flower-order-status">
                                                {ORDER_STATUS[order.status]?.flower || order.status}
                                            </span>
                                        </div>
                    
                                        <h3 className="flower-order-customer">
                                            {order.izdelki?.[0]?.paketnik?.naslov ? order.izdelki[0].paketnik.naslov.split(',').map((part, idx) => (
                                                <span key={idx} style={{display: 'block'}}>{part.trim()}</span>
                                            )) : "Neznan paketnik"}
                                        </h3>

                                        <p className="flower-order-email" style={{marginBottom: "15px", color: "#666"}}>
                                            {order.izdelki?.[0]?.paketnik?.ime || "Naslov ni izbran"}
                                        </p>

                                        <div className="flower-order-info">
                                            <div className="flower-order-info-row">
                                                <span className="flower-order-label">Product name</span>
                                                <span className="flower-order-price">{order.izdelki?.[0]?.ime_izdelka || "ni podatka"}</span>
                                            </div>

                                            <div className="flower-order-info-row">
                                                <span className="flower-order-label">Number of products</span>
                                                <span className="flower-order-value">{order.izdelki?.length || 0}</span>
                                            </div>

                                            <div className="flower-order-info-row">
                                                <span className="flower-order-label">Total price</span>
                                                <span className="flower-order-price">{order.skupna_cena} €</span>
                                            </div>

                                            {order.status == 'prevzeto' && (
                                                <div className="flower-order-info-row">
                                                    <span className="flower-order-label">Date of delivery</span>
                                                    <span className="flower-order-price">{formatDeliveryDate(order.datum_dostave)}</span>
                                                </div>
                                            )} 

                                            <div className="flower-order-card-date-order">
                                                <span className="flower-order-createdAt">
                                                    {formatDateTime(order.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {order.status !== 'caka_na_prevzem' && order.status !== 'prevzeto' && (
                                        <button
                                            className="flower-order-accept-btn"
                                            onClick={() =>
                                                order.status === 'v_pripravi'
                                                    ? handleDeliveredOrder(order)
                                                    : handleAcceptOrder(order)
                                            }
                                        >
                                            {order.status === 'v_pripravi' ? 'Delivered' : 'Accept order'}
                                        </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="split-home-container">
            <section className="preview-side">
                {selectedPlant && (
                    <button className="back-button" onClick={() => setSelectedPlant(null)}> 
                        <ArrowLeft size={24} strokeWidth={3} /> Back
                    </button>
                )}
                
                <div className="paketnik-visual-container">
                    <img src={paketnikImg} alt="Paketnik" className="paketnik-base" />
                    {selectedPlant && (
                        <img 
                            key={selectedPlant._id}
                            src={`http://localhost:3001${selectedPlant.path}`} 
                            alt={selectedPlant.name} 
                            className="plant-in-paketnik"
                        />
                    )}
                </div>
            </section>

            <section className="content-side">
                {selectedPlant ? (
                    <div className="plant-details-view" ref={detailsRef}>
                        <div className="details-container">
                            {isEditing ? (
                                <>
                                    <div className="input-group-modern">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Plant name"
                                        />
                                    </div>

                                    <div className="input-group-modern">
                                        <label>Price</label>
                                        <input
                                            type="text"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            placeholder="25"
                                        />
                                    </div>

                                    <div className="input-group-modern">
                                        <label>Description</label>
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            className="edit-plant-textarea"
                                            placeholder="Description"
                                        />
                                    </div>

                                    <div className="input-group-modern">
                                        <label>Care</label>
                                        <textarea
                                            value={editCare}
                                            onChange={(e) => setEditCare(e.target.value)}
                                            className="edit-plant-textarea"
                                            placeholder="Care"
                                        />
                                    </div>

                                    <button
                                        className="main-add-btn"
                                        onClick={() => updatePlant(selectedPlant._id)}
                                    >
                                        Save changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    {isAdmin && (
                                        <div style={{ position: 'absolute', top: '5px', right: '10px', display: 'flex', gap: '5px' }}>
                                            {/* GUMB ZA UREJANJE - Pencil */}
                                            <button 
                                                className="admin-delete-top-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(true);
                                                    setEditName(selectedPlant.name);
                                                    setEditPrice(selectedPlant.price);
                                                    setEditDescription(selectedPlant.description);
                                                    setEditCare(selectedPlant.care);
                                                }}  
                                                style={{
                                                    border: 'none', background: 'transparent', color: '#8dbd5e', 
                                                    padding: '10px', cursor: 'pointer', transition: '0.3s'
                                                }}
                                                title="Edit plant"
                                            > 
                                                <Pencil size={20} />
                                            </button>

                                            {/* GUMB ZA BRISANJE - Trash */}
                                            <button 
                                                className="admin-delete-top-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePlant(selectedPlant._id);
                                                }}
                                                style={{
                                                    border: 'none', background: 'transparent', color: '#ff4d4d', 
                                                    padding: '10px', cursor: 'pointer', transition: '0.3s'
                                                }}
                                                title="Delete plant"
                                            > 
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    )}
                                    <h2 className="details-title">{selectedPlant.name}</h2>
                                    <p className="details-price">{selectedPlant.price}€</p>

                                    <p><b>DESCRIPTION: </b></p>
                                    <p className="details-description">{selectedPlant.description}</p>

                                    <p><b>CARE: </b></p>
                                    <p className="details-care">{selectedPlant.care}</p>

                                    <div className="plant-features-row">
                                    <div 
                                        className={`feature-item clickable ${activeFeature === 'light' ? 'highlight' : ''}`}
                                        onClick={() => setActiveFeature('light')}
                                    >
                                        <div className="feature-icon-circle">
                                            <Sun size={20} />
                                        </div>
                                        <span>{selectedPlant.svetloba || "Low light"}</span>
                                    </div>

                                    <div 
                                        className={`feature-item clickable ${activeFeature === 'water' ? 'highlight' : ''}`}
                                        onClick={() => setActiveFeature('water')}
                                    >
                                        <div className="feature-icon-circle">
                                            <Droplet size={24} />
                                        </div>
                                        <span>{selectedPlant.zalivanje || "Water daily"}</span>
                                    </div>

                                    <div 
                                        className={`feature-item clickable ${activeFeature === 'cost' ? 'highlight' : ''}`}
                                        onClick={() => setActiveFeature('cost')}
                                    >
                                        <div className="feature-icon-circle">
                                            <Tag size={20} />
                                        </div>
                                        <span>{selectedPlant.cena_rang || "Low cost"}</span>
                                    </div>
                                </div>

                                <div className="searches-section">
                                    <h3 className="searches-title">
                                        Searches ({activeFeature === 'light' ? 'Light interest' : activeFeature === 'cost' ? 'Price checks' : 'Water needs'})
                                    </h3>
                                    <div className="graph-container">
                                        <svg viewBox="0 0 300 80" className="graph-svg">
                                            <path 
                                                d={graph.path} 
                                                fill="none" 
                                                strokeWidth="2" 
                                                className="graph-path"
                                            />
                                        </svg>
                                        
                                        <div className="graph-badge" style={{ left: graph.badgeLeft }}>
                                            {graph.value}
                                        </div>

                                        <div className="graph-days">
                                            {days.map((day, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className={idx === graph.activeDayIdx ? 'active-day' : ''}
                                                >
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {user && (
                                    <div className="details-footer">
                                        <button 
                                            className="main-add-btn full-width" 
                                            onClick={handleAddToCart}
                                            disabled={cartCount >= 1}
                                            style={cartCount >= 1 ? { 
                                                backgroundColor: '#b3b3b3', 
                                                cursor: 'not-allowed', 
                                                color: '#ffffff',
                                                opacity: 0.8
                                            } : {}}
                                        >
                                            {cartCount >= 1 ? (
                                                <>Cart is full <ShoppingCart size={24} /></>
                                            ) : (
                                                <>Add to cart <ShoppingCart size={24} strokeWidth={3} /></>
                                            )}
                                        </button>
                                    </div>
                                )}
                                </>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="infinite-scroll-viewport" ref={scrollRef} onScroll={handleScroll}>
                        <div className="bubble-list">
                            {displayPlants.map((plant, index) => (
                                <div 
                                    key={`${plant._id}-${index}`} 
                                    className="bubble-card"
                                    onClick={() => setSelectedPlant({...plant, clickId: Date.now()})}
                                >
                                    <img 
                                        src={`http://localhost:3001${plant.path}`} 
                                        alt={plant.name} 
                                        className="card-floating-img"
                                    />
                                    <div className="bubble-info">
                                        <h3>{plant.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;