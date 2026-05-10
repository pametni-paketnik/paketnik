import React, { useState, useEffect, useContext } from "react";
import { UserContext } from './userContext';
import { useNavigate } from "react-router-dom";
import ProgressBar from './ProgressBar'; 
import PaymentForm from "./Payment";
import './index.css'; 
import PaketnikMap from './PaketnikMap'; 

const OrderForm = () =>{
    const [currentStep, setCurrentStep] = useState(0); 
    const [selectedLocker, setSelectedLocker] = useState(null);

    const { user: contextUser } = useContext(UserContext);
    const [user, setUser] = useState(() => {
        if(contextUser) return contextUser; 
        const stored = localStorage.getItem("user"); 
        return stored ? JSON.parse(stored) : null; 
    });

    const navigate = useNavigate();

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const goToStep = (step) => setCurrentStep(step); 

    useEffect(() => {
        if (contextUser) {
            setUser(contextUser);
        }
    }, [contextUser]); 

    return (
    <div className="checkout-container">
        <ProgressBar currentStep={currentStep} setStep={goToStep} />

        <div className="form-content-wrapper" style={{ marginTop: '40px' }}>
        
        {currentStep === 0 && (
          <div className="step-content">
            <h1>Order Summary</h1>
            <p>Tukaj so vaši izdelki...</p>
            <button onClick={nextStep} className="pay-button">Dostava</button>
          </div>
        )}

        {currentStep === 1 && (
            <div className="step-content">
                <h1>Izberite lokacijo dostave</h1>
            
                <div className="map-wrapper">
                    <PaketnikMap onSelect={(locker) => setSelectedLocker(locker)} user={user} />
                </div>

            {selectedLocker && (
                <div className="selected-info">
                    <p>Izbran paketnik: <strong>{selectedLocker.name}</strong></p>
                </div>
            )}

            <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                <button onClick={prevStep} className="pay-button secondary">Nazaj</button>
                <button 
                    onClick={nextStep} 
                    className="pay-button" 
                    disabled={!selectedLocker}>
                    Nadaljuj na plačilo
                </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
            <PaymentForm 
                currentStep={currentStep}
                onNext={nextStep}
                onBack={prevStep} 
            />
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h1>Review your order</h1>
            <p>Preverite podatke pred koncem...</p>
            <button onClick={prevStep} className="pay-button">Nazaj</button>
            <button onClick={() => alert("Naročilo oddano!")} className="pay-button">FINISH</button>
          </div>
        )}
        </div>
    </div>
  );
};

export default OrderForm;