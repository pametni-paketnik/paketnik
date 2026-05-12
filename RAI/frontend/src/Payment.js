import React, { useState, useEffect, useContext } from "react";
import ProgressBar from './ProgressBar'; 
import { UserContext } from "./userContext";
import './index.css'; 

const PaymentForm = ({ onNext, onBack, currentStep }) => {
  
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
      cardholder: '',
      cardNumber: '',
      month: '',
      year: '',
      cvv: ''
  }); 

  useEffect(() => {
    if (user) {
      const datumPoteka = user.datum_poteka || '';
      const parts = datumPoteka.split('/');

      const month = parts[0] || '';
      const year = parts[1] ? `20${parts[1]}` : '';

      setFormData({
        cardholder: user.ime_na_kartici || '',
        cardNumber: user.stevilka_kartice || '',
        month: month,
        year: year,
        cvv: user.cvv || ''
      });
    }
  }, [user]);

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
               <button className="pay-button" type="button" onClick={onNext}>PAY</button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PaymentForm;