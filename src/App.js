import React from 'react';
// import ChatbotOpenAI from './Chatbot';
import { AuthProvider, useAuth } from './hooks/AuthProvider';
import ChatbotSalesforce from './ChatbotSalesforce';
import nttDataLogo from './NTT_Data-Logo.wine.png';
import './App.css';

const logoStyle = {
  position: 'absolute',
  top: '10px',
  left: '40px',
  width: '200px',
};

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Agentforce</h1>
        <img src={nttDataLogo} alt="NTT Data Logo" style={logoStyle} />
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </header>
    </div>
  );
}

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Authenticating...</div>; // Show loading spinner or message
  }

  if (!isAuthenticated) {
    return <div>Authentication failed.</div>; // Redirect to login or show appropriate message
  }

  return <ChatbotSalesforce />; // Render your app if authenticated
};

export default App;
