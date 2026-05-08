import React, { useState } from 'react';

function AddImage() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Prosim, izberi datoteko!");
            return;
        }
        console.log("Nalagam datoteko:", file.name);
        // Tukaj boš kasneje dodal fukncijo za pošiljanje na backend (axios.post)
        alert("Funkcija za nalaganje slike je pripravljena!");
    };

    return (
        <div style={{ 
            backgroundColor: "#f9f9f9", 
            padding: "30px", 
            borderRadius: "10px", 
            textAlign: "center",
            border: "1px solid #ddd" 
        }}>
            <h2 style={{ color: "#6F4E37" }}>Admin: Dodaj novo sliko</h2>
            <p>Izberite fotografijo rastline ali lokacije.</p>
            
            <input 
                type="file" 
                onChange={handleFileChange} 
                style={{ marginBottom: "20px" }}
            />
            <br />
            <button 
                onClick={handleUpload}
                style={{
                    backgroundColor: "#6F4E37",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Naloži sliko
            </button>
        </div>
    );
}

export default AddImage;