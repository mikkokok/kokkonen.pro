import './index.css';
import App from './App.tsx';
import {BrowserRouter as Router} from 'react-router-dom';
import {getMsalInstance} from './lib/auth/msal.ts';
import ReactDOM from 'react-dom/client';
import React from 'react';
import {MsalProvider} from '@azure/msal-react';
import {ThemeProvider} from '@mui/material';
import theme from './lib/theme/theme.ts';

const msalInstance = getMsalInstance();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <ThemeProvider theme={theme}>
        <Router>
          <App />
        </Router>
      </ThemeProvider>
    </MsalProvider>
  </React.StrictMode>,
);
