import React, { useState } from 'react';
import { RequestType, Role } from '../types';
import { db } from '../services/mockDb';
import { Send, UploadCloud, CheckCircle } from 'lucide-react';

interface RequestFormProps {
  onSuccess: () => void;
  currentUser: { username: string; email: string };
}

const RequestForm: React.FC<RequestFormProps> = ({ onSuccess, currentUser }) => {
  const [formData, setFormData] = useState({
    taskTitle: '',
    requestTypes: [] as RequestType[],
    requestDetails: '',
    officeName: '',
    employeeID: '',
    mobileNo: '',
    extensionNo: ''
  });

  const handleTypeChange = (type: RequestType) => {
    setFormData(prev => {
      if (prev.requestTypes.includes(type)) {
        return { ...prev, requestTypes: prev.requestTypes.filter(t => t !== type) };
      } else {
        return { ...prev, requestTypes: [...prev.requestTypes, type] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.requestTypes.length === 0) {
        alert("Please select at least one request type.");
        return;
    }
    db.createRequest({
      taskTitle: formData.taskTitle,
      requesterName: currentUser.username,
      requesterEmail: currentUser.email,
      employeeID: formData.employeeID,
      officeName: formData.officeName,
      extensionNo: formData.extensionNo,
      mobileNo: formData.mobileNo,
      requestTypes: formData.requestTypes,
      requestDetails: formData.requestDetails,
    });
    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
             <UploadCloud className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">New Work Request</h2>
          <p className="text-slate-500 mt-1">Submit a new request to the BCO team.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Task Title</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300 font-medium text-lg"
                placeholder="e.g. Convocation Video Coverage"
                value={formData.taskTitle}
                onChange={(e) => setFormData({...formData, taskTitle: e.target.value})}
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Employee ID</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300"
                placeholder="e.g. EMP-123"
                value={formData.employeeID}
                onChange={(e) => setFormData({...formData, employeeID: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Office / Dept</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300"
                placeholder="e.g. Computer Science"
                value={formData.officeName}
                onChange={(e) => setFormData({...formData, officeName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile No</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300"
                placeholder="017..."
                value={formData.mobileNo}
                onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Extension No</label>
              <input
                type="text"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300"
                placeholder="e.g. 101"
                value={formData.extensionNo}
                onChange={(e) => setFormData({...formData, extensionNo: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Request Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(RequestType).map((type) => (
                <label key={type} className={`
                  relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all select-none
                  ${formData.requestTypes.includes(type) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}
                `}>
                  <input
                    type="checkbox"
                    value={type}
                    checked={formData.requestTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{type}</span>
                  {formData.requestTypes.includes(type) && <CheckCircle className="w-3 h-3 ml-2" />}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Details & Requirements</label>
            <textarea
              required
              rows={5}
              className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-300"
              placeholder="Describe what you need in detail..."
              value={formData.requestDetails}
              onChange={(e) => setFormData({...formData, requestDetails: e.target.value})}
            />
            <p className="mt-2 text-xs text-slate-400">Please provide dimensions, text content, and reference links if applicable.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-5 h-5" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;