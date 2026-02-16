import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { ErrorBoundary } from './components/error-boundary';
import { RuntimeAuthProvider } from './lib/auth/runtime';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RuntimeAuthProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </RuntimeAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
