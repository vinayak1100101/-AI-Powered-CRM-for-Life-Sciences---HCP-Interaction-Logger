// frontend/src/App.jsx
import React from 'react';
import LogInteractionScreen from './components/LogInteractionScreen';
import InteractionList from './components/InteractionList';
import './App.css'; // Optional App-specific styles

function App() {
  return (
    <div className="App">
      {/* Optional Header */}
      <header className="app-header">
          <h1>AI-Powered CRM</h1>
          {/* Add navigation or branding here */}
      </header>

      <main className="app-content">
          <LogInteractionScreen />
          <hr className="content-separator" />
          <InteractionList />
      </main>

      {/* Optional Footer */}
      {/* <footer className="app-footer"> ... </footer> */}
    </div>
  );
}

export default App;
