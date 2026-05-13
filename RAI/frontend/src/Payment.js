import React, { useState, useEffect, useContext } from "react"; 
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
    <div className="payment-container-minimal">
      <div className="card-visual-modern">
        <div className="card-inner">
          <div className="card-top">
            <div className="card-chip"></div>
            <div className="card-type">VISA</div>
          </div>
          
          <div className="card-number-display">
            {formData.cardNumber || "•••• •••• •••• ••••"}
          </div>
          
          <div className="card-bottom">
            <div className="card-info">
              <span className="label">Card Holder</span>
              <span className="value">{formData.cardholder || "YOUR NAME"}</span>
            </div>
            <div className="card-info">
              <span className="label">Expires</span>
              <span className="value">{formData.month || '00'}/{formData.year?.toString().slice(-2) || '00'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-fields">
        <div className="input-group-modern">
          <label>Ime kartice</label>
          <input 
            type="text" 
            value={formData.cardholder}
            onChange={handleNameChange}
            placeholder="LOREM IPSUM"
          />
        </div>

        <div className="input-group-modern">
          <label>Številka kartice</label>
          <input 
            type="text" 
            value={formData.cardNumber}
            onChange={handleCardNumChange} 
            placeholder="0000 0000 0000 0000"
          />
        </div>

        <div className="row-modern">
          <div className="input-group-modern">
            <label>Mesec</label>
            <input type="text" value={formData.month} onChange={(e) => handleNumberInput('month', e.target.value, 2)} placeholder="MM" />
          </div>
          <div className="input-group-modern">
            <label>Leto</label>
            <input type="text" value={formData.year} onChange={(e) => handleNumberInput('year', e.target.value, 4)} placeholder="YYYY" />
          </div>
          <div className="input-group-modern">
            <label>CVV</label>
            <input type="text" value={formData.cvv} onChange={(e) => handleNumberInput('cvv', e.target.value, 3)} placeholder="123" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;