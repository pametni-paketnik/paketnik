import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight } from 'lucide-react';
import { UserContext } from './userContext';

function Login() {
    const [email, setEmail] = useState('');
    const [geslo, setGeslo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUserContext } = useContext(UserContext); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/uporabnik/login', {
                email,
                geslo
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log("Prijava uspela:", response.data);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setUserContext(response.data.user || response.data);
                navigate('/'); 
            }
        } catch (err) {
            console.error("Napaka pri prijavi:", err);
            setError(err.response?.data?.message || 'Napačni podatki za prijavo ali težava s strežnikom.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                
                <div className="register-visual">
                    <div className="visual-content">
                        <h2 className="visual-title uppercase-text">Dobrodošli nazaj</h2>
                        <div className="visual-divider"></div>
                        <p className="visual-text">
                            Prijavite se v svoj račun in nadaljujte <br/> z upravljanjem sistema InPlant.
                        </p>
                    </div>
                </div>

                <div className="register-form-section">
                    <div className="form-header">
                        <div className="icon-box">
                            <LogIn size={24} />
                        </div>
                        <h1 className="uppercase-text">Prijava</h1>
                        <p>Vnesite svoje podatke za dostop do profila.</p>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="row-modern">
                            <div className="input-group-modern">
                                <label>E-pošta</label>
                                <input 
                                    type="email" 
                                    placeholder="ime@primer.si" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="input-group-modern">
                            <label>Geslo</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                required
                                value={geslo}
                                onChange={(e) => setGeslo(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn uppercase-text"
                            disabled={loading}
                        >
                            {loading ? 'Prijavljanje...' : 'Prijava'} <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                        </button>
                    </form>

                    <p className="login-link">
                        Še nimate računa? <Link to="/register" className="uppercase-text">Registriraj se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;