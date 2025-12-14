import React from 'react';
import { db } from '../services/mockDb';

interface LoginProps {
  onLogin: (userId: number) => void;
  onBackToHome: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBackToHome }) => {
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

        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
             <span className="text-white font-bold text-2xl">BCO</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to the Workflow Manager</p>
        </div>

        <div className="space-y-4">
           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-2">Select User Persona</p>
           <button
            onClick={() => onLogin(1)}
            className="w-full group relative flex items-center p-4 border border-slate-200 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-indigo-600 font-bold transition-colors">MA</div>
            <div className="ml-4 text-left">
              <p className="font-bold text-slate-800 group-hover:text-indigo-700">Master Admin</p>
              <p className="text-xs text-slate-500">Approves & Assigns Requests</p>
            </div>
          </button>

          <button
            onClick={() => onLogin(2)}
            className="w-full group relative flex items-center p-4 border border-slate-200 rounded-2xl hover:border-pink-500 hover:bg-pink-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-pink-600 font-bold transition-colors">DT</div>
            <div className="ml-4 text-left">
              <p className="font-bold text-slate-800 group-hover:text-pink-700">Design Team</p>
              <p className="text-xs text-slate-500">Executes Design Tasks</p>
            </div>
          </button>
          
          <button
            onClick={() => onLogin(5)} // User 5 is Media Team (MediaLab)
            className="w-full group relative flex items-center p-4 border border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
             <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-emerald-600 font-bold transition-colors">MT</div>
            <div className="ml-4 text-left">
              <p className="font-bold text-slate-800 group-hover:text-emerald-700">Media Team</p>
              <p className="text-xs text-slate-500">Photo & Video Coverage</p>
            </div>
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          Daffodil International University &copy; 2025
        </div>
      </div>
    </div>
  );
};

export default Login;