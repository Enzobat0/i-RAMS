import React, { useState } from 'react';
import Login from './components/Login';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ConfigurationPage from './pages/ConfigurationPage';
import './index.css';

function App() {
  // --- Auth state ---
  // Pre-populate from localStorage so a page refresh doesn't log the user out
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
  // 'dashboard' | 'configuration'
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Called by Login component on successful authentication
  const handleLoginSuccess = (role, name) => {
    setUserRole(role);
    setUserName(name);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  // Called by Sidebar logout button
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

  // Render the correct page component based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'configuration':
        return <ConfigurationPage userRole={userRole} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={(role, name) => handleLoginSuccess(role, name)}
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