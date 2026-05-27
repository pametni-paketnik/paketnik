import React, { useContext, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, Camera, Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import { UserContext } from './userContext';

const FACE_API_URL = process.env.REACT_APP_FACE_API_URL || 'http://localhost:8000';

function Login() {
    const [email, setEmail]     = useState('');
    const [geslo, setGeslo]     = useState('');
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const [korak, setKorak]         = useState('login');
    const [faceStatus, setFaceStatus] = useState(null);
    const [faceMsg, setFaceMsg]       = useState('');
    const [faceScore, setFaceScore]   = useState(null);

    const [cameraOn, setCameraOn]   = useState(false);
    const [preview, setPreview]     = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const videoRef   = useRef(null);
    const streamRef  = useRef(null);
    const fileInputRef = useRef(null);

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
                localStorage.setItem('user_pending', JSON.stringify(response.data.user));
                setKorak('face');
            }
        } catch (err) {
            console.error("Napaka pri prijavi:", err);
            setError(err.response?.data?.message || 'Napačni podatki ali težava s strežnikom.');
        } finally {
            setLoading(false);
        }
    };

    const zageniKamero = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            streamRef.current = stream;
            setCameraOn(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch {
            setError('Kamera ni dostopna. Prosim dovoli dostop ali naloži sliko.');
        }
    };

    const zapriKamero = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraOn(false);
    };

    const zajemiSliko = useCallback(() => {
        const canvas = document.createElement('canvas');
        canvas.width  = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        canvas.toBlob(blob => {
            const file = new File([blob], 'obraz.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreview(URL.createObjectURL(blob));
            setFaceStatus(null);
            zapriKamero();
        }, 'image/jpeg', 0.92);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setFaceStatus(null);
    };

    const preveriObraz = async () => {
        if (!selectedFile) return;
        setFaceStatus('loading');
        setFaceMsg('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await axios.post(`${FACE_API_URL}/verify`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { verified, confidence, label, message } = res.data;
            setFaceScore(Math.round(confidence * 100));

            if (verified) {
                setFaceStatus('ok');
                setFaceMsg(`Dobrodošla, ${label}! (${Math.round(confidence * 100)}%)`);
                setTimeout(() => {
                    const user = JSON.parse(localStorage.getItem('user_pending'));
                    localStorage.removeItem('user_pending');
                    localStorage.setItem('user', JSON.stringify(user));
                    setUserContext(user);
                    navigate('/');
                }, 1200);
            } else {
                setFaceStatus('fail');
                setFaceMsg(message || 'Obraz ni prepoznan. Poskusi znova.');
            }
        } catch (err) {
            setFaceStatus('fail');
            setFaceMsg('Napaka pri preverjanju obraza. Je API zagnan?');
            console.error(err);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">

                <div className="register-visual">
                    <div className="visual-content">
                        <h2 className="visual-title uppercase-text">
                            {korak === 'login' ? 'Welcome back' : 'Face ID'}
                        </h2>
                        <div className="visual-divider"></div>
                        <p className="visual-text">
                            {korak === 'login'
                                ? 'Step 1 of 2: Log in to your account and continue z upravljanjem sistema InPlant.'
                                : 'Step 2 of 2: Verify your identity with facial recognition.'}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
                            <div style={{
                                width: 32, height: 4, borderRadius: 2,
                                background: '#fff', opacity: korak === 'login' ? 1 : 0.4
                            }} />
                            <div style={{
                                width: 32, height: 4, borderRadius: 2,
                                background: '#fff', opacity: korak === 'face' ? 1 : 0.4
                            }} />
                        </div>
                    </div>
                </div>

                <div className="register-form-section">

                    {korak === 'login' && (
                        <>
                            <div className="form-header">
                                <div className="icon-box"><LogIn size={24} /></div>
                                <h1 className="uppercase-text">Login</h1>
                                <p>Enter your information to access your profile.</p>
                            </div>

                            {error && (
                                <div className="error-message" style={{
                                    color: 'red', marginBottom: '15px', fontWeight: 'bold',
                                    textAlign: 'center', fontSize: '0.8rem'
                                }}>{error}</div>
                            )}

                            <form onSubmit={handleSubmit} className="register-form">
                                <div className="row-modern">
                                    <div className="input-group-modern">
                                        <label>E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="name@example.si"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="input-group-modern">
                                    <label>Password</label>
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
                                    {loading ? 'Logging...' : 'Login'}
                                    <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                                </button>
                            </form>

                            <p className="login-link">
                                Don't have an account yet?{' '}
                                <Link to="/register" className="uppercase-text">Register</Link>
                            </p>
                        </>
                    )}

                    {korak === 'face' && (
                        <>
                            <div className="form-header">
                                <div className="icon-box"><Camera size={24} /></div>
                                <h1 className="uppercase-text">Verify identity</h1>
                                <p>Take a picture of your face or upload a photo.</p>
                            </div>

                            {cameraOn && (
                                <div style={{ marginBottom: '1rem', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
                                    <button className="submit-btn" onClick={zajemiSliko} style={{ borderRadius: 0 }}>Capture image</button>
                                </div>
                            )}

                            {preview && !cameraOn && (
                                <div style={{ marginBottom: '1rem', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <img src={preview} alt="Predogled" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
                                </div>
                            )}

                            {faceStatus === 'loading' && (
                                <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
                                    <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />
                                    I'm checking my face...
                                </div>
                            )}
                            {faceStatus === 'ok' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem', background: '#f0faf4', border: '1px solid #a8d5b5', borderRadius: 8, marginBottom: '1rem', color: '#2d6a4f', fontWeight: 600 }}>
                                    <CheckCircle size={18} /> {faceMsg}
                                </div>
                            )}
                            {faceStatus === 'fail' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem', background: '#fff0f0', border: '1px solid #f5a8a8', borderRadius: 8, marginBottom: '1rem', color: '#c1440e', fontWeight: 600 }}>
                                    <XCircle size={18} /> {faceMsg}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {!cameraOn ? (
                                    <button className="submit-btn" onClick={zageniKamero}>
                                        <Camera size={18} style={{ marginRight: 8 }} /> Open camera
                                    </button>
                                ) : (
                                    <button className="submit-btn" onClick={zapriKamero} style={{ background: '#666' }}>
                                        Close camera
                                    </button>
                                )}

                                <button className="submit-btn" style={{ background: '#3a3a38' }}
                                    onClick={() => fileInputRef.current.click()}>
                                    <Upload size={18} style={{ marginRight: 8 }} /> Upload image
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*"
                                    style={{ display: 'none' }} onChange={handleFileChange} />

                                {selectedFile && faceStatus !== 'loading' && faceStatus !== 'ok' && (
                                    <button className="submit-btn uppercase-text" onClick={preveriObraz}>
                                        Confirm identity <ArrowRight size={18} style={{ marginLeft: 10 }} />
                                    </button>
                                )}

                                <button onClick={() => { zapriKamero(); setKorak('login'); setPreview(null); setSelectedFile(null); setFaceStatus(null); }}
                                    style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    ← Back to login
                                </button>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Login;