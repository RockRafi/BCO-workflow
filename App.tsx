import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RequestForm from './components/RequestForm';
import PublicHome from './components/PublicHome';
import Login from './components/Login';
import { Role, User } from './types';
import { db } from './services/mockDb';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Views: 'public' (default), 'login', 'dashboard', 'new-request'
  const [currentView, setCurrentView] = useState('public');

  const handleLogin = (userId: number) => {
    const user = db.getUser(userId);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('public');
  };

  // If not logged in
  if (!currentUser) {
    if (currentView === 'login') {
      return (
        <Login 
          onLogin={handleLogin} 
          onBackToHome={() => setCurrentView('public')}
        />
      );
    }
    // Default to Public Home
    return <PublicHome onLoginClick={() => setCurrentView('login')} />;
  }

  // Logged in Layout
  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onChangeView={setCurrentView}
    >
      {currentView === 'dashboard' && <Dashboard currentUser={currentUser} />}
      {currentView === 'new-request' && (
        <RequestForm 
          currentUser={currentUser} 
          onSuccess={() => setCurrentView('dashboard')} 
        />
      )}
    </Layout>
  );
};

export default App;