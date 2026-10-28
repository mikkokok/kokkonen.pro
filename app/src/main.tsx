import './index.css';
import App from './App.tsx';
import {BrowserRouter as Router} from 'react-router-dom';
import {getMsalInstance} from './lib/auth/msal.ts';
import ReactDOM from 'react-dom/client';
import React from 'react';
import {MsalProvider} from '@azure/msal-react';
import {Provider} from 'react-redux';
import {store} from './store/store';

async function bootstrap() {
  const instance = await getMsalInstance();
  const rootElement = document.getElementById('root') as HTMLElement;
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <MsalProvider instance={instance}>
          <Router>
            <App />
          </Router>
        </MsalProvider>
      </Provider>
    </React.StrictMode>
  );
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap application', error);
});