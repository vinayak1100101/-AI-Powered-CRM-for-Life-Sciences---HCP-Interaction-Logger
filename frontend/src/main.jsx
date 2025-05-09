// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Import global CSS

import { Provider } from 'react-redux'; // Import Provider
import { store } from './store/store'; // Import your Redux store

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}> {/* Wrap App with Redux Provider */}
      <App />
    </Provider>
  </React.StrictMode>,
);
