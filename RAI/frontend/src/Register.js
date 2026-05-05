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
                
                {/* Levi vizualni del */}
                <div className="register-visual">
                    <div className="visual-content">
                        <h2 className="visual-title uppercase-text">Registracija</h2>
                        <div className="visual-divider"></div>
                        <p className="visual-text">
                            Ustvarite svoj profil in se pridružite <br/> digitalnemu ekosistemu InPlant.
                        </p>
                    </div>
                </div>

                {/* Desni del z obrazcem */}
                <div className="register-form-section">
                    <div className="form-header">
                        <div className="icon-box">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="uppercase-text">Ustvari račun</h1>
                        <p>Vnesite svoje podatke za dostop.</p>
                    </div>

                    {/* Izpis napake, če obstaja */}
                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="input-group-row">
                            <input 
                                type="text" 
                                placeholder="IME" 
                                required
                                value={ime}
                                className="clean-input" 
                                onChange={(e) => setIme(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="PRIIMEK" 
                                required
                                value={priimek}
                                className="clean-input" 
                                onChange={(e) => setPriimek(e.target.value)}
                            />
                            <input 
                                type="email" 
                                placeholder="E-POŠTA" 
                                required
                                className="clean-input" 
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                            <input 
                                type="password" 
                                placeholder="GESLO" 
                                required
                                className="clean-input" 
                                onChange={(e) => setGeslo(e.target.value)}
                                value={geslo}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="submit-btn uppercase-text"
                            disabled={loading}
                        >
                            {loading ? 'Pošiljanje...' : 'Registracija'} <ArrowRight size={18} />
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