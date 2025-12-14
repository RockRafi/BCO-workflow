import React, { useState } from 'react';
import { RequestType } from '../types';
import { db } from '../services/mockDb';
import { Send, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

interface PublicHomeProps {
  onLoginClick: () => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ onLoginClick }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    employeeID: '',
    officeName: '',
    extensionNo: '',
    mobileNo: '',
    requestTypes: [] as RequestType[],
    requestDetails: ''
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

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      db.createRequest({
        ...formData
      });
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Request Received!</h2>
          <p className="text-slate-500 mb-8 text-lg">
            Thank you, <b>{formData.requesterName}</b>. Your request has been submitted to the BCO team. You will receive an email update shortly.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
             BCO
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Workflow</span>
        </div>
        <button 
          onClick={onLoginClick}
          className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2"
        >
          Staff Portal
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 z-0 opacity-40">
           <svg className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/4" width="800" height="800" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#C7D2FE" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,82,21.5,70.6,32.2C59.2,42.9,47.9,51.4,36.1,58.5C24.3,65.6,12.2,71.3,-0.6,72.4C-13.4,73.5,-26.8,70,-39.2,63.4C-51.6,56.8,-63.1,47.1,-71.4,35.1C-79.7,23.1,-84.8,8.8,-83.4,-4.8C-82,-18.4,-74.1,-31.3,-63.9,-41.8C-53.7,-52.3,-41.2,-60.4,-28.4,-68.4C-15.6,-76.4,-2.5,-84.3,11.5,-86.3L25.5,-88.3Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute bottom-0 left-0 transform -translate-x-1/3 translate-y-1/4" width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#E0E7FF" d="M41.3,-69.9C51.6,-61.5,56.8,-46.5,62.1,-32.8C67.4,-19,72.9,-6.6,72.6,5.8C72.3,18.1,66.3,30.4,57.5,40.1C48.7,49.8,37.1,56.9,25.1,61.9C13.1,66.9,0.7,69.8,-11.1,68.8C-22.9,67.8,-34,62.9,-44.3,55.1C-54.6,47.3,-64,36.6,-69.4,24.1C-74.8,11.7,-76.2,-2.5,-72.1,-15.1C-68,-27.7,-58.5,-38.7,-47.4,-46.9C-36.4,-55.1,-23.8,-60.5,-10.7,-60.1C2.5,-59.8,15.6,-53.6,31,-78.3L41.3,-69.9Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Official Request Portal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Bring your ideas <br/><span className="text-indigo-600">to life.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            The Branding & Communications Office (BCO) is here to help you tell your story. Submit requests for design, media coverage, PR, and more.
          </p>
          <button 
            onClick={() => document.getElementById('request-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
          >
            Start a Request
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Form Section */}
      <section id="request-form" className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-8 md:p-12">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Request Form</h2>
            <p className="text-slate-500 mt-1">Please provide detailed information to help us execute your request efficiently.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Employee ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. EMP-101"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.employeeID}
                  onChange={(e) => setFormData({...formData, employeeID: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Office / Department</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Student Affairs"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.officeName}
                  onChange={(e) => setFormData({...formData, officeName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Requester Name</label>
                <input
                  required
                  type="text"
                  placeholder="Your Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="you@diu.edu.bd"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.requesterEmail}
                  onChange={(e) => setFormData({...formData, requesterEmail: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mobile No</label>
                <input
                  required
                  type="tel"
                  placeholder="017..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Extension No</label>
                <input
                  type="text"
                  placeholder="e.g. 123"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.extensionNo}
                  onChange={(e) => setFormData({...formData, extensionNo: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Request Type (Select Multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {Object.values(RequestType).map((type) => (
                  <label key={type} className={`
                    cursor-pointer flex items-center justify-center py-3 px-4 rounded-xl border font-medium text-sm transition-all select-none
                    ${formData.requestTypes.includes(type) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
                  `}>
                    <input
                      type="checkbox"
                      value={type}
                      checked={formData.requestTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                      className="sr-only"
                    />
                    {type}
                    {formData.requestTypes.includes(type) && <CheckCircle className="w-4 h-4 ml-2" />}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Requirement Details</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your request in detail. Include dimensions, text content, deadlines, etc."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border-slate-200 border focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                value={formData.requestDetails}
                onChange={(e) => setFormData({...formData, requestDetails: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0
                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-slate-50 py-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Daffodil International University. All rights reserved.</p>
        <p className="mt-2">Branding & Communications Office</p>
      </footer>
    </div>
  );
};

export default PublicHome;