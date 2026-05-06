import React, { useState } from "react";
import './index.css'; 

const PaymentForm = () => {
  const [formData, setFormData] = useState({
      cardholder: 'LOREM IPSUM', 
      cardNumber: '1234 5679 9012 3456', 
      month: '08', 
      year: '2030', 
      cvv: '123'
  }); 

  const handleCardNumChange = (e) =>{
    let value = e.target.value.replace(/\D/g, ''); 
    value = value.substring(0, 16); 

    const formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';

    setFormData({
      ...formData, 
      cardNumber: formattedValue
    }); 
  };

  const handleNumberInput = (name, value, maxLength) =>{
    const cleaned = value.replace(/\D/g, '').substring(0, maxLength); 
    setFormData({
      ...formData, 
      [name]: cleaned
    });
  };

  const handleNameChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); 
    if(value.length <= 20){
      setFormData({...formData, cardholder: value.toUpperCase()}); 
    } 
  };

  
  return (
    <div className="payment-container">
      <div className="payment-card-wrapper">
        
        <main className="payment-content">
          {/* Vizualna kartica */}
          <div className="card-stack">
            <div className="card-shadow-layer"></div>
            <div className="card-visual">
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div style={{width: '45px', height: '35px', background: 'rgba(255,255,255,0.5)', borderRadius: '5px'}}></div>
                  <div style={{fontSize: '20px', fontWeight: 'bold', fontStyle: 'italic'}}>VISA</div>
              </div>
              
              <div className="card-number-display">{formData.cardNumber || "•••• •••• •••• ••••"}</div>
              
              <div className="card-footer">
                <div>
                  <div className="card-holder-label">Cardholder Name</div>
                  <div style={{letterSpacing: '1px'}}>{formData.cardholder || "YOUR NAME"}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="card-holder-label">Expiry</div>
                  <div>{formData.month || '00'}/{formData.year?.toString().slice(-2) || '00'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Obrazec za vnos */}
          <section className="form-section">
            <h2>Payment details</h2>
            
            <div className="input-group">
              <label>Cardholder Name</label>
              <input 
                type="text" 
                value={formData.cardholder}
                onChange={handleNameChange}
                placeholder="LOREM IPSUM"
              />
            </div>

            <div className="input-group">
              <label>Card Number</label>
              <input 
                type="text" 
                value={formData.cardNumber}
                onChange={handleCardNumChange} 
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="row">
              <div className="input-group">
                <label>Month</label>
                <input 
                  type="text" 
                  value={formData.month} 
                  onChange={(e) => handleNumberInput('month', e.target.value, 2)}
                  placeholder="MM"
                />
              </div>
              <div className="input-group">
                <label>Year</label>
                <input 
                  type="text" 
                  value={formData.year} 
                  onChange={(e) => handleNumberInput('year', e.target.value, 4)}
                  placeholder="YYYY"
                />
              </div>
              <div className="input-group">
                <label>CVV</label>
                <input 
                  type="text" 
                  value={formData.cvv} 
                  onChange={(e) => handleNumberInput('cvv', e.target.value, 3)}
                  placeholder="123"
                />
              </div>
            </div>

            <div style={{textAlign: 'right', marginTop: '20px'}}>
               <p style={{color: '#000', fontSize: '1rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase'}}>Total: <span style={{color: '#6F4E37', fontWeight: '800', fontSize: '1.4rem'}}>$1234</span></p>
               <button className="pay-button" type="button">PAY</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PaymentForm;