import React, { useState } from "react";
import ProgressBar from './ProgressBar'; 
import PaymentForm from "./Payment";
import './index.css'; 

const OrderForm = () =>{
    const [currentStep, setCurrentStep] = useState(0); 

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const goToStep = (step) => setCurrentStep(step); 

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
            <h1>Shipping Information</h1>
            <p>Vnesite naslov...</p>
            <button onClick={prevStep} className="pay-button">Nazaj</button>
            <button onClick={nextStep} className="pay-button">Plačilo</button>
          </div>
        )}

        {currentStep === 2 && (
          <PaymentForm 
            currentStep={currentStep}
            onNext={nextStep}
            onBack={prevStep} />
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