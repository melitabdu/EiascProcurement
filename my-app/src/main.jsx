import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext'; // ✅ Import provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>   {/* Wrap your app with provider */}
        <App />
      </AdminAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
