import React, { useState } from 'react';
import Login from './components/Login';
import Survey from './components/Survey'; 
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn ? (
        <Survey />
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;