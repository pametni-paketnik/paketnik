import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [geslo, setGeslo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepričaj se, da backend teče na portu 3000
            const response = await axios.post('http://localhost:3000/uporabnik/login', {
                email,
                geslo
            }, { withCredentials: true });

            if (response.status === 200) {
                console.log("Prijava uspela:", response.data);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/profile'); 
            }
        } catch (err) {
            console.error("Napaka pri prijavi:", err);
            setError(err.response?.data?.message || 'Napačni podatki za prijavo ali težava s strežnikom.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container"> {/* Uporabljamo enake kontejneje kot pri registraciji */}
            <div className="register-card">
                
                {/* Levi vizualni del - Rjava barva #6F4E37 */}
                <div className="register-visual">
                    <div className="visual-content">
                        <h2 className="visual-title uppercase-text">Dobrodošli nazaj</h2>
                        <div className="visual-divider"></div>
                        <p className="visual-text">
                            Prijavite se v svoj račun in nadaljujte <br/> z upravljanjem sistema InPlant.
                        </p>
                    </div>
                </div>

                {/* Desni del z obrazcem */}
                <div className="register-form-section">
                    <div className="form-header">
                        <div className="icon-box">
                            <LogIn size={24} />
                        </div>
                        <h1 className="uppercase-text">Prijava</h1>
                        <p>Vnesite svoje podatke za dostop do profila.</p>
                    </div>

                    {/* Izpis napake */}
                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="input-group-row">
                            <input 
                                type="email" 
                                placeholder="E-POŠTA" 
                                required
                                className="clean-input" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input 
                                type="password" 
                                placeholder="GESLO" 
                                required
                                className="clean-input" 
                                value={geslo}
                                onChange={(e) => setGeslo(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn uppercase-text"
                            disabled={loading}
                        >
                            {loading ? 'Prijavljanje...' : 'Prijava'} <ArrowRight size={18} />
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