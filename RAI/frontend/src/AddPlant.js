import { useContext, useState } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from './userContext';
import { FaCloudUploadAlt, FaFileSignature, FaCommentAlt, FaEuroSign} from 'react-icons/fa';

function AddPlant() {
    const userContext = useContext(UserContext); 
    const [name, setName] = useState('');
    const [price, setPrice] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [care, setCare] = useState(''); 
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
        formData.append('description', description); 
        formData.append('care', care); 
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
                    <h1 className='uppercase-text'>Add plant</h1>
                </div>

                <form className="publish-form" onSubmit={onSubmit}>
                    {/* IME RASTLINE */}
                    <div className="input-group-modern">
                        <label><FaFileSignature className="meta-icon" /> Plant name</label>
                        <input 
                            type="text" 
                            placeholder="WRITE NAME..." 
                            className="uppercase-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            required 
                        />
                    </div>

                    {/* CENA */}
                    <div className="input-group-modern">
                        <label><FaEuroSign className="meta-icon" /> Price</label>
                        <input 
                            type="text" 
                            placeholder="15.00 €" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            required 
                        />
                    </div>

                    {/* OPIS (Description v modelu) */}
                    <div className="input-group-modern">
                        <label><FaCommentAlt className="meta-icon" /> Description</label>
                        <input 
                            type="text" 
                            placeholder="Tell me something about this plant..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            required 
                        />
                    </div>

                    {/* VZDRZEVANJE */}
                    <div className="input-group-modern">
                        <label><FaCommentAlt className="meta-icon" /> Care</label>
                        <input 
                            type="text" 
                            placeholder="Tell me how this plant is maintained..." 
                            value={care} 
                            onChange={(e) => setCare(e.target.value)}
                            required 
                        />
                    </div>

                    {/* SLIKA */}
                    <div className="input-group-modern">
                        <label><FaCommentAlt className="meta-icon" /> CHOOSE PHOTO:</label>
                        <input 
                            type="file" 
                            id="file-upload"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])} 
                        />
                    </div>

                    <div className="profile-footer">
                        <button className="submit-btn uppercase-text" type="submit">
                            ADD TO LIST
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddPlant;