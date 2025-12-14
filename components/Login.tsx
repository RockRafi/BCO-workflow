import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { Lock, User } from 'lucide-react';

interface LoginProps {
  onLogin: (userId: number) => void;
  onBackToHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.authenticate(username, password);
    if (user) {
      onLogin(user.id);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-0 w-full h-full bg-slate-50">
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                      </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
           </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full relative z-10 border border-slate-100">
        <button 
          onClick={onBackToHome}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 text-sm font-medium"
        >
          ← Back
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
             <span className="text-white font-bold text-2xl">BCO</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Portal</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to manage workflows</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
             <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs font-bold text-blue-800 uppercase mb-2">Default Credentials</p>
          <div className="text-xs text-blue-600 space-y-1">
            <p>Master Admin: <span className="font-mono bg-white px-1 rounded">master_admin</span> / <span className="font-mono bg-white px-1 rounded">admin</span></p>
            <p>Design Team: <span className="font-mono bg-white px-1 rounded">design_lead</span> / <span className="font-mono bg-white px-1 rounded">123</span></p>
            <p>Media Team: <span className="font-mono bg-white px-1 rounded">media_team</span> / <span className="font-mono bg-white px-1 rounded">123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;