import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App.jsx';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_API_KEY}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </GoogleOAuthProvider>
);

reportWebVitals();
