import React, { useState, useEffect } from 'react';
import { Request, Task, Role, Status, RequestType } from '../types';
import { db } from '../services/mockDb';
import { Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, MoreHorizontal, Send, ExternalLink, Calendar, Eye, UserPlus, X, UploadCloud, HardDrive, Phone, Filter, Search, History } from 'lucide-react';

interface DashboardProps {
  currentUser: { id: number; role: Role };
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State
  const [assignNotes, setAssignNotes] = useState('');
  const [assignTargetRole, setAssignTargetRole] = useState<Role>(Role.DESIGN);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  useEffect(() => {
    // Apply Filters
    let result = requests;
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.requesterName.toLowerCase().includes(lower) || 
        r.id.toString().includes(lower) ||
        r.officeName.toLowerCase().includes(lower)
      );
    }
    setFilteredRequests(result);
  }, [statusFilter, searchTerm, requests]);

  const refreshData = () => {
    const allRequests = db.getRequests();
    
    if (currentUser.role === Role.MASTER) {
      setRequests(allRequests);
    } else if (currentUser.role === Role.EMPLOYEE) {
      setRequests(allRequests.filter(r => r.requesterName.includes('Requester') || r.id === 101)); 
    } else {
      // Team View: Show requests assigned to this team
      setRequests(allRequests.filter(r => 
        r.tasks?.some(t => t.assignedToRoleId === currentUser.role)
      ));
    }
  };

  const handleAssign = () => {
    if (selectedRequest) {
      db.assignTask(selectedRequest.id, currentUser.id, assignTargetRole, assignNotes);
      setIsAssignModalOpen(false);
      setAssignNotes('');
      refreshData();
    }
  };

  const handleSubmitWork = () => {
    if (selectedRequest && selectedRequest.tasks) {
      const task = selectedRequest.tasks.find(t => t.assignedToRoleId === currentUser.role);
      if (task) {
        db.submitTask(task.id, submissionLink, submissionNotes);
        setIsSubmitModalOpen(false);
        setSubmissionLink('');
        setSubmissionNotes('');
        refreshData();
      }
    }
  };

  // Mock Drive Upload
  const handleMockDriveUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setSubmissionLink('https://drive.google.com/file/d/1B2x.../view?usp=sharing');
      setIsUploading(false);
    }, 1500);
  };

  // --- Master Admin Specific Stats ---
  const pendingCount = requests.filter(r => r.status === Status.PENDING).length;
  const approvedTodayCount = requests.filter(r => r.status === Status.ASSIGNED || r.status === Status.APPROVED_BY_MASTER).length;
  const eventsTodayCount = requests.filter(r => r.requestTypes.includes(RequestType.EVENT)).length;

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case Status.ASSIGNED: return 'bg-blue-100 text-blue-700 border-blue-200';
      case Status.SUBMITTED: return 'bg-purple-100 text-purple-700 border-purple-200';
      case Status.FINALIZED: return 'bg-green-100 text-green-700 border-green-200';
      case Status.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      case Status.CHANGES_REQUESTED: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* --- HEADER SECTION --- */}
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentUser.role === Role.MASTER ? 'Master Admin Dashboard' : `${currentUser.role} Team Dashboard`}
          </h1>
          <p className="text-slate-500 mt-1">
            {currentUser.role === Role.MASTER 
              ? 'Overview of office performance and pending approvals' 
              : 'Manage your assigned tasks and submit deliverables'}
          </p>
        </div>
        
        {/* Master Admin Stats Cards */}
        {currentUser.role === Role.MASTER && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Approved Today</p>
                <p className="text-2xl font-bold text-slate-900">{approvedTodayCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Event Support</p>
                <p className="text-2xl font-bold text-slate-900">{eventsTodayCount}</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search ID, Name, Office..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            {Object.values(Status).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      
      {/* Master View: Data Table */}
      {currentUser.role === Role.MASTER ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Request List
            </h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              {filteredRequests.length} Items
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Requester</th>
                  <th className="px-6 py-4 font-semibold">Types</th>
                  <th className="px-6 py-4 font-semibold">Office</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                       No requests found matching filters.
                     </td>
                   </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">#{req.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {req.requesterName}
                        <div className="text-xs text-slate-400 font-normal">{req.mobileNo}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {req.requestTypes.map(type => (
                            <span key={type} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                              {type}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{req.officeName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedRequest(req); setIsViewModalOpen(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === Status.PENDING && (
                            <button 
                              onClick={() => { setSelectedRequest(req); setIsAssignModalOpen(true); }}
                              className="flex items-center gap-1 bg-slate-900 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                            >
                              <UserPlus className="w-3 h-3" />
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* --- Employee/Sub-team View --- */
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
             <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
              <p className="text-slate-500">No active tasks assigned to you right now.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)} uppercase tracking-wider`}>
                        {req.status}
                      </span>
                      <span className="text-slate-400 text-xs">#{req.id}</span>
                      <div className="flex gap-1">
                        {req.requestTypes.map(t => (
                           <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{req.requestDetails}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3">
                       <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {new Date(req.submissionDate).toLocaleDateString()}
                       </span>
                       <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" /> {req.mobileNo} (Ext: {req.extensionNo})
                       </span>
                    </div>
                    
                    {/* Master Instructions Section */}
                    {req.tasks && req.tasks.length > 0 && req.tasks[0].masterNotes && (
                       <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-800 uppercase mb-1">Instruction from Master Admin</p>
                          <p className="text-indigo-900 text-sm">{req.tasks[0].masterNotes}</p>
                       </div>
                    )}
                  </div>

                  {/* Right: Action */}
                  <div className="flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 pt-4 lg:pt-0 lg:pl-6 lg:border-l border-slate-100 min-w-[200px]">
                      {req.status === Status.ASSIGNED && (
                        <button 
                          onClick={() => { setSelectedRequest(req); setIsSubmitModalOpen(true); }}
                          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1"
                        >
                          <UploadCloud className="w-5 h-5" />
                          Submit Work
                        </button>
                      )}
                      
                      {req.status === Status.SUBMITTED && (
                        <div className="text-center lg:text-right">
                          <p className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-2 inline-block">Under Review</p>
                          {req.tasks?.[0]?.driveFolderLink && (
                            <a href={req.tasks[0].driveFolderLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                              View Submitted Files <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* View Details Modal (With History) */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                <p className="text-slate-500 text-sm">ID: #{selectedRequest.id}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
               {/* Requester Info */}
               <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Requester</label>
                    <p className="text-slate-900 font-medium">{selectedRequest.requesterName}</p>
                    <p className="text-slate-500 text-sm">{selectedRequest.requesterEmail}</p>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Contact</label>
                     <p className="text-slate-900 text-sm"><span className="text-slate-400">Mob:</span> {selectedRequest.mobileNo}</p>
                     <p className="text-slate-900 text-sm"><span className="text-slate-400">Ext:</span> {selectedRequest.extensionNo}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Office</label>
                    <p className="text-slate-900 font-medium">{selectedRequest.officeName}</p>
                    <p className="text-slate-500 text-sm">{selectedRequest.employeeID}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Categories</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedRequest.requestTypes.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-md font-semibold">{t}</span>
                      ))}
                    </div>
                  </div>
               </div>
               
               {/* Description */}
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap p-4 bg-white border border-slate-200 rounded-xl">{selectedRequest.requestDetails}</p>
               </div>

               {/* History Timeline */}
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block flex items-center gap-2">
                    <History className="w-4 h-4" /> Request History
                  </label>
                  <div className="relative border-l-2 border-slate-100 ml-2 space-y-6">
                    {selectedRequest.history?.map((log, idx) => (
                      <div key={idx} className="ml-6 relative">
                        <div className="absolute -left-[31px] w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-sm"></div>
                        <p className="text-sm font-bold text-slate-800">{log.action}</p>
                        <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          By <span className="font-medium text-indigo-600">{log.actorName}</span> 
                          {log.details && <span className="text-slate-400"> - {log.details}</span>}
                        </p>
                      </div>
                    ))}
                    {selectedRequest.history?.length === 0 && <p className="ml-6 text-sm text-slate-400">No history available.</p>}
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-full transition-colors">Close</button>
              {currentUser.role === Role.MASTER && selectedRequest.status === Status.PENDING && (
                <button 
                  onClick={() => { setIsViewModalOpen(false); setIsAssignModalOpen(true); }}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-colors"
                >
                  Assign Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Request</h2>
              <p className="text-slate-500 text-sm mt-1">Select a team to handle request #{selectedRequest?.id}.</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To Team</label>
                <div className="grid grid-cols-2 gap-2">
                  {[Role.DESIGN, Role.PR, Role.MEDIA_LAB, Role.SOCIAL_MEDIA].map(role => (
                    <button
                      key={role}
                      onClick={() => setAssignTargetRole(role)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        assignTargetRole === role 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Master Instructions</label>
                <textarea
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] text-sm p-3"
                  placeholder="Enter specific instructions for the team..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-full transition-colors">Cancel</button>
              <button onClick={handleAssign} className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Modal (Enhanced with Drive integration) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Submit Deliverables</h2>
              <p className="text-slate-500 text-sm mt-1">Upload files to Drive and notify Master Admin.</p>
            </div>
            <div className="p-6 space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assets Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    placeholder="https://drive.google.com/..."
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    disabled={isUploading}
                  />
                  {/* Google Drive Integration Button */}
                  <button 
                    onClick={handleMockDriveUpload}
                    disabled={isUploading || submissionLink.length > 0}
                    className={`px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold border transition-colors ${
                      submissionLink.length > 0 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="Upload to Google Drive"
                  >
                    {isUploading ? (
                       <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></span>
                    ) : submissionLink.length > 0 ? (
                       <CheckCircle2 className="w-5 h-5" />
                    ) : (
                       <HardDrive className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {submissionLink && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Drive Link generated successfully
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Submission Notes</label>
                <textarea
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] text-sm p-3"
                  placeholder="Describe the work done..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsSubmitModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-full transition-colors">Cancel</button>
              <button onClick={handleSubmitWork} className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;