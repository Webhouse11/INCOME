import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  console.log("INCOMELAB: Initiating application mount...");
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error("INCOMELAB CRITICAL: Root element #root not found.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("INCOMELAB: Render sequence started.");
  } catch (error) {
    console.error("INCOMELAB CRITICAL: Application render failed:", error);
    
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Inter', sans-serif; color: #111827; text-align: center; padding: 40px; background: #f9fafb;">
        <div style="background: white; padding: 32px; border-radius: 24px; border: 1px solid #e5e7eb; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
          <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; color: #2563eb;">Initialization Error</h1>
          <p style="color: #4b5563; max-width: 380px; margin-bottom: 24px; line-height: 1.6;">The application failed to start. This is usually due to a temporary module loading conflict.</p>
          <button onclick="window.location.reload()" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; font-size: 16px;">
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
};

// Check readyState to ensure script executes even if defer/async behaviors vary across CDNs
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}