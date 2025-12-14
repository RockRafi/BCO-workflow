import React from 'react';
import { User, Role } from '../types';
import { LayoutDashboard, PlusCircle, LogOut, FileText, Layers, PenTool, Hash, Video, Settings as SettingsIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, currentView, onChangeView }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ...(currentUser.role === Role.EMPLOYEE ? [
      { id: 'new-request', label: 'New Request', icon: <PlusCircle className="w-5 h-5" /> }
    ] : []),
    ...(currentUser.role === Role.MASTER ? [
      { id: 'settings', label: 'System Settings', icon: <SettingsIcon className="w-5 h-5" /> }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row font-sans">
      {/* Sidebar Navigation Rail */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-10 sticky top-0 h-screen">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              BCO
            </div>
            <span className="hidden lg:block ml-3 font-bold text-slate-800 text-lg tracking-tight">Workflow</span>
          </div>

          <nav className="mt-8 flex flex-col gap-2 px-2 lg:px-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center p-3 rounded-2xl transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <span className={`transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:block ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 mb-2">
          <div className="flex flex-col lg:flex-row items-center lg:gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {currentUser.role.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{currentUser.username}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.designation}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center lg:justify-start p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block ml-2 text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        {/* Abstract Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-50 to-slate-50 -z-10 overflow-hidden">
             <svg className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4" width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4338CA" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,82,21.5,70.6,32.2C59.2,42.9,47.9,51.4,36.1,58.5C24.3,65.6,12.2,71.3,-0.6,72.4C-13.4,73.5,-26.8,70,-39.2,63.4C-51.6,56.8,-63.1,47.1,-71.4,35.1C-79.7,23.1,-84.8,8.8,-83.4,-4.8C-82,-18.4,-74.1,-31.3,-63.9,-41.8C-53.7,-52.3,-41.2,-60.4,-28.4,-68.4C-15.6,-76.4,-2.5,-84.3,11.5,-86.3L25.5,-88.3Z" transform="translate(100 100)" />
            </svg>
        </div>
        
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;