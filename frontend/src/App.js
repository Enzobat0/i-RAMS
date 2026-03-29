import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ConfigurationPage from './pages/ConfigurationPage';
import InventoryPage from './pages/InventoryPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import './index.css';

function App() {
  // --- Auth state ---
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('access_token')
  );
  const [userRole, setUserRole] = useState(
    () => localStorage.getItem('user_role') || ''
  );
  const [userName, setUserName] = useState(
    () => localStorage.getItem('user_name') || ''
  );

  // --- Page routing state ---
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLoginSuccess = (role, name) => {
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'configuration':
        return <ConfigurationPage userRole={userRole} />;
      case 'inventory':
        return <InventoryPage />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  // Privacy policy — accessible without login
  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={(role, name) => handleLoginSuccess(role, name)}
        onShowPrivacy={() => setShowPrivacy(true)}
      />
    );
  }

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userRole={userRole}
      userName={userName}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default App;