import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Uvoz useNavigate za preusmeritev
import { UserPlus, ArrowRight } from 'lucide-react';

function Register() {
    const [ime, setIme] = useState("");
    const [priimek, setPriimek] = useState("");
    const [email, setEmail] = useState("");
    const [geslo, setGeslo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate(); // Hook za navigacijo

    async function handleRegister(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Prepričaj se, da backend teče na portu 3000
            const res = await fetch("/uporabnik", {
                method: 'POST',
                cache: 'no-store', // Prepreči status 304
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, ime, priimek, geslo })
            });
            
            const data = await res.json();

            if (res.ok) {
                // Če je registracija uspela, pojdi na login
                navigate("/login");
            } else {
                setError(data.message || "Registracija ni uspela.");
            }
        } catch (err) {
            console.error("Napaka pri povezavi:", err);
            setError("Napaka pri povezavi s strežnikom.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                
                <div className="register-visual">
                    <div className="visual-content">
                        <h2 className="visual-title uppercase-text">Registracija</h2>
                        <div className="visual-divider"></div>
                        <p className="visual-text">
                            Ustvarite svoj profil in se pridružite <br/> digitalnemu ekosistemu InPlant.
                        </p>
                    </div>
                </div>

                <div className="register-form-section">
                    <div className="form-header">
                        <div className="icon-box">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="uppercase-text">Ustvari račun</h1>
                        <p>Vnesite svoje podatke za dostop.</p>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="register-form">
                        
                        <div className="row-modern">
                            <div className="input-group-modern">
                                <label>Ime</label>
                                <input 
                                    type="text" 
                                    placeholder="Joe" 
                                    required
                                    value={ime}
                                    onChange={(e) => setIme(e.target.value)}
                                />
                            </div>
                            <div className="input-group-modern">
                                <label>Priimek</label>
                                <input 
                                    type="text" 
                                    placeholder="Doe" 
                                    required
                                    value={priimek}
                                    onChange={(e) => setPriimek(e.target.value)}
                                />
                            </div>
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
                            {loading ? 'Pošiljanje...' : 'Registracija'} <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                        </button>
                    </form>

                    <p className="login-link">
                        Že imate račun? <Link to="/login" className="uppercase-text">Prijavi se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;