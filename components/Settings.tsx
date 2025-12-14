import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Role, User, SystemSettings } from '../types';
import { Save, Plus, Trash2, Users, HardDrive, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(db.getSettings());
  const [newUser, setNewUser] = useState({ username: '', password: '', role: Role.DESIGN, designation: '', email: '' });

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(db.getUsers().filter(u => u.role !== Role.MASTER && u.role !== Role.EMPLOYEE));
  };

  const handleSaveSettings = () => {
    db.updateSettings(settings);
    alert('System settings updated successfully.');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;
    
    db.addUser({
      ...newUser,
      role: newUser.role,
      email: newUser.email || `${newUser.username.toLowerCase().replace(/\s/g, '')}@diu.edu.bd`
    });
    setNewUser({ username: '', password: '', role: Role.DESIGN, designation: '', email: '' });
    refreshUsers();
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to remove this team account?')) {
      db.deleteUser(id);
      refreshUsers();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Manage team access, drive storage, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* General Configuration */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <HardDrive className="w-5 h-5 text-indigo-600" />
             <h2 className="text-lg font-bold text-slate-800">Storage & Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Master Google Drive Folder</label>
              <p className="text-xs text-slate-400 mb-2">Root folder where all team submissions will be organized.</p>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                value={settings.masterDriveLink}
                onChange={(e) => setSettings({...settings, masterDriveLink: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Master Notification Email</label>
              <div className="flex items-center gap-2">
                 <Bell className="w-4 h-4 text-slate-400" />
                 <input
                  type="email"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
                  value={settings.masterNotificationEmail}
                  onChange={(e) => setSettings({...settings, masterNotificationEmail: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              className="mt-4 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
             <Users className="w-5 h-5 text-indigo-600" />
             <h2 className="text-lg font-bold text-slate-800">Team Access Management</h2>
          </div>

          {/* Add User Form */}
          <form onSubmit={handleCreateUser} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
             <h3 className="text-xs font-bold uppercase text-slate-500">Create New Team Account</h3>
             <div className="grid grid-cols-2 gap-3">
               <input
                 required
                 placeholder="Team Username"
                 className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                 value={newUser.username}
                 onChange={(e) => setNewUser({...newUser, username: e.target.value})}
               />
               <input
                 required
                 placeholder="Password"
                 type="password"
                 className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                 value={newUser.password}
                 onChange={(e) => setNewUser({...newUser, password: e.target.value})}
               />
               <select 
                 className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                 value={newUser.role}
                 onChange={(e) => setNewUser({...newUser, role: e.target.value as Role})}
               >
                 <option value={Role.DESIGN}>Design Team</option>
                 <option value={Role.MEDIA_LAB}>Media Team</option>
                 <option value={Role.PR}>PR Team</option>
                 <option value={Role.SOCIAL_MEDIA}>Social Media</option>
               </select>
               <input
                 placeholder="Designation / Title"
                 className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                 value={newUser.designation}
                 onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
               />
             </div>
             <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
               <Plus className="w-4 h-4" /> Add User
             </button>
          </form>

          {/* User List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {u.role.substring(0,2)}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800">{u.username}</p>
                       <p className="text-xs text-slate-500">{u.designation}</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => handleDeleteUser(u.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
            {users.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No team accounts found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;