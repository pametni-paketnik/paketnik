import { useContext, useState } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from './userContext';
import { FaCloudUploadAlt, FaFileSignature, FaCommentAlt, FaEuroSign} from 'react-icons/fa';

function AddPlant() {
    const userContext = useContext(UserContext); 
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); 
    const [message, setMessage] = useState(''); 
    const [file, setFile] = useState(null);
    const [uploaded, setUploaded] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();

        if (!name || !price || !file) {
            alert("Prosim izpolnite obvezna polja!");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price); 
        formData.append('message', message); 
        formData.append('image', file);
        formData.append('naZalogi', 'false');

        try {
            const res = await fetch('http://localhost:3000/plant', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setUploaded(true);
            } else {
                const errorData = await res.json();
                alert("Napaka pri dodajanju rastline: " + errorData.message);
            }
        } catch (err) {
            console.error("Napaka:", err);
        }
    }

    if (!userContext.user) return <Navigate replace to="/login" />;
    if (uploaded) return <Navigate replace to="/" />;

    return (
        <div className="publish-container">
            <div className="publish-card">
                <div className="publish-header">
                    <FaCloudUploadAlt className="publish-icon" />
                    <h1>Dodaj rastlino</h1>
                </div>

                <form className="publish-form" onSubmit={onSubmit}>
                    {/* IME RASTLINE */}
                    <div className="input-group">
                        <label><FaFileSignature className="meta-icon" /> Ime rastline</label>
                        <input 
                            type="text" 
                            placeholder="VNESI IME..." 
                            className="uppercase-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            required 
                        />
                    </div>

                    {/* CENA */}
                    <div className="input-group">
                        <label><FaEuroSign className="meta-icon" /> Cena</label>
                        <input 
                            type="text" 
                            placeholder="NPR. 15.00 €" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            required 
                        />
                    </div>

                    {/* OPIS (Message v modelu) */}
                    <div className="input-group">
                        <label><FaCommentAlt className="meta-icon" /> Opis</label>
                        <textarea 
                            placeholder="Povej kaj o tej rastlini..." 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    {/* SLIKA */}
                    <div className="input-group">
                        <div className="file-input-wrapper">
                            <input 
                                type="file" 
                                id="file-upload"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])} 
                            />
                            <label htmlFor="file-upload" className="custom-file-upload">
                                {file ? file.name : "Izberi fotografijo rastline"}
                            </label>
                        </div>
                    </div>

                    <div className="profile-footer">
                        <button className="nav-btn" type="submit">
                            DODAJ NA SEZNAM
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddPlant;