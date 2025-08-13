import React from 'react';

export default function ErrorPage(){
    return (
        <div className="error-page">
            <h1>404 - Página não encontrada</h1>
            <p>A rota acessada não existe</p>
            <p>Confere se adicionou a rota em router.jsx ;)</p>
        </div>     
    )
}