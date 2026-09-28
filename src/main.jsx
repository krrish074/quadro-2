/**
 * GRAND LINE LEDGER - Application Entry Point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import CSS Styles in logical cascade order
import './styles/theme.css';
import './styles/global.css';
import './styles/components.css';
import './styles/sidebar.css';
import './styles/dashboard.css';
import './styles/forms.css';
import './styles/animations.css';
import './styles/responsive.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
