import './index.css';
import App from './App.tsx';
import {BrowserRouter as Router} from 'react-router-dom';
import {getMsalInstance} from './lib/auth/msal.ts';
import ReactDOM from 'react-dom/client';
import React from 'react';
import {MsalProvider} from '@azure/msal-react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <MsalProvider instance={await getMsalInstance()}>
      <Router>
        <App />
      </Router>
    </MsalProvider>
  </React.StrictMode>
);