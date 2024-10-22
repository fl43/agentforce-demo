import React from 'react';
// import ChatbotOpenAI from './Chatbot';
import { AuthProvider, useAuth} from './hooks/AuthProvider';
import ChatbotSalesforce from './ChatbotSalesforce';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Chatbot</h1>
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
