import React, { useState } from "react";
import './index.css'; 

const ProgressBar = ({ currentStep, setStep }) => {
    const steps = ["Order", "Shipping", "Payment", "Review"];

    return (
    <div className="stepper-wrapper">
      <div className="stepper-line"></div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`step-node ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'is-current' : ''}`}
            // Ko kliknemo na točko, pokličemo setStep s številko tega koraka
            onClick={() => setStep(index)}
            style={{ cursor: 'pointer' }} // Da uporabnik ve, da se da klikniti
          >
            <div className="step-circle">
              {index === currentStep && <div className="step-dot"></div>}
            </div>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};  

export default ProgressBar; 