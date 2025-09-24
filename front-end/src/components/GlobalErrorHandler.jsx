import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const GlobalErrorHandler = () => {
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: '',
    message: '',
    redirectTo: null
  });

  useEffect(() => {
    const handleApiError = (event) => {
      const { type, title, message, redirectTo } = event.detail;
      
      console.error(`🚨 API Error [${type}]:`, message);
      
      setErrorModal({
        open: true,
        title,
        message,
        redirectTo
      });
    };

    // Escutar eventos de erro da API
    window.addEventListener('apiError', handleApiError);
    
    return () => {
      window.removeEventListener('apiError', handleApiError);
    };
  }, []);

  const handleCloseModal = () => {
    setErrorModal({ open: false, title: '', message: '', redirectTo: null });
    
    // Se há redirect, fazer após fechar modal
    if (errorModal.redirectTo) {
      window.location.href = errorModal.redirectTo;
    }
  };

  return (
    <Modal
      isOpen={errorModal.open}
      onClose={handleCloseModal}
      texto={
        <>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '1.2em', 
            marginBottom: '12px',
            color: '#d32f2f'
          }}>
            {errorModal.title}
          </div>
          <div style={{ 
            fontSize: '1em', 
            lineHeight: '1.4',
            color: '#333'
          }}>
            {errorModal.message}
          </div>
        </>
      }
      showClose={true}
    />
  );
};

export default GlobalErrorHandler;