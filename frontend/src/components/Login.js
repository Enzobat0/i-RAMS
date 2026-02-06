import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulating the 1.5s delay from your design
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLoginSuccess(); // Triggers the view change in App.js
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-[#364153]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-fadeIn">
        <div className="p-8 md:p-10">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            {/* <div className="bg-[#2B7FFF] text-white p-3 rounded-lg shadow-md mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div> */}
            <h1 className="text-3xl font-bold tracking-tight">i-RAMS</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2B7FFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="demo@irams.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#2B7FFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B7FFF] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all flex items-center justify-center"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Login"}
            </button>
          </form>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#2B7FFF] via-blue-400 to-[#2B7FFF]"></div>
      </div>
    </div>
  );
};

export default Login;