import React, { useState, useEffect } from 'react';
import { Request, Task, Role, Status, RequestType, Notification } from '../types';
import { db } from '../services/mockDb';
import { Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, MoreHorizontal, Send, ExternalLink, Calendar, Eye, UserPlus, X, UploadCloud, HardDrive, Phone, Filter, Search, History, Bell, Edit2, Trash2, FolderOpen } from 'lucide-react';

interface DashboardProps {
  currentUser: { id: number; role: Role };
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  
  // Settings Data
  const settings = db.getSettings();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State
  const [assignNotes, setAssignNotes] = useState('');
  // Multi-select for teams
  const [assignTargetRoles, setAssignTargetRoles] = useState<Role[]>([]);
  
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    refreshData();
  }, [currentUser, isAssignModalOpen, isSubmitModalOpen]); // Auto refresh on modal close

  // --- DATA REFRESH ---
  const refreshData = () => {
    const allRequests = db.getRequests();
    setNotifications(db.getNotifications(currentUser.role));
    
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

  useEffect(() => {
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

  // --- ACTIONS ---

  const handleAssignRoleToggle = (role: Role) => {
    if (assignTargetRoles.includes(role)) {
      setAssignTargetRoles(assignTargetRoles.filter(r => r !== role));
    } else {
      setAssignTargetRoles([...assignTargetRoles, role]);
    }
  };

  const handleAssign = () => {
    if (selectedRequest && assignTargetRoles.length > 0) {
      assignTargetRoles.forEach(role => {
         db.assignTask(selectedRequest.id, currentUser.id, role, assignNotes);
      });
      setIsAssignModalOpen(false);
      setAssignNotes('');
      setAssignTargetRoles([]);
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

  const handleEditSubmission = (req: Request) => {
    const task = req.tasks?.find(t => t.assignedToRoleId === currentUser.role);
    if (task) {
        setSubmissionLink(task.driveFolderLink || '');
        setSubmissionNotes(task.employeeSubmissionNotes || '');
        setSelectedRequest(req);
        setIsSubmitModalOpen(true);
    }
  };

  const handleDeleteSubmission = (req: Request) => {
     if(confirm('Are you sure you want to delete this submission?')) {
        const task = req.tasks?.find(t => t.assignedToRoleId === currentUser.role);
        if(task) {
            db.deleteTaskSubmission(task.id);
            refreshData();
        }
     }
  };

  const handleMockDriveUpload = () => {
    setIsUploading(true);
    // Simulate upload process to the configured Master folder
    setTimeout(() => {
      // In a real app, this would be the actual file link. 
      // For now we use the master link + mock path structure.
      const simulatedPath = `${settings.masterDriveLink}&path=${currentUser.role}/${new Date().toISOString().split('T')[0]}/Task_${selectedRequest?.id}`;
      setSubmissionLink(simulatedPath);
      setIsUploading(false);
    }, 1500);
  };

  const markRead = (id: number) => {
      db.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n));
  };

  // --- STATS ---
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
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {currentUser.role === Role.MASTER ? 'Master Admin Dashboard' : `${currentUser.role} Team Workspace`}
          </h1>
          <p className="text-slate-500 mt-1">
            {currentUser.role === Role.MASTER 
              ? 'Overview of office performance and pending approvals' 
              : 'Manage your assigned tasks and upload deliverables'}
          </p>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
             <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white border border-slate-200 rounded-full hover:bg-slate-50 relative"
             >
                 <Bell className="w-5 h-5 text-slate-600" />
                 {unreadCount > 0 && (
                     <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                 )}
             </button>

             {/* Dropdown */}
             {showNotifications && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                     <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                         <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                         <span className="text-xs text-slate-400">{unreadCount} new</span>
                     </div>
                     <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-center text-xs text-slate-400">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} onClick={() => markRead(n.id)} className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                </div>
                            ))
                        )}
                     </div>
                 </div>
             )}
        </div>
      </header>

      {/* --- STATS (Master Only) --- */}
      {currentUser.role === Role.MASTER && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Approved Today</p>
                <p className="text-2xl font-bold text-slate-900">{approvedTodayCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
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
         <button onClick={refreshData} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
            Refresh
         </button>
      </div>

      {/* --- CONTENT SECTION --- */}
      
      {/* Master View: Data Table */}
      {currentUser.role === Role.MASTER ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Requester</th>
                  <th className="px-6 py-4 font-semibold">Types</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned To</th>
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
                        <div className="text-xs text-slate-400 font-normal">{req.officeName}</div>
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
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                       <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                           {req.tasks && req.tasks.length > 0 ? (
                             req.tasks.map((t, idx) => (
                               <div key={idx} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={t.assignedToRoleId}>
                                 {t.assignedToRoleId.substring(0,2)}
                               </div>
                             ))
                           ) : <span className="text-xs text-slate-400">Unassigned</span>}
                        </div>
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
        /* --- Employee/Team View --- */
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.length === 0 ? (
             <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 col-span-1">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Workspace Empty</h3>
              <p className="text-slate-500">No active tasks assigned to the {currentUser.role} team.</p>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const task = req.tasks?.find(t => t.assignedToRoleId === currentUser.role);
              const isSubmitted = !!task?.driveFolderLink;

              return (
              <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                 {/* Card Header */}
                 <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <span className="bg-white border border-slate-200 text-slate-500 text-xs font-mono px-2 py-1 rounded">#{req.id}</span>
                       <span className={`px-2 py-1 rounded-full text-xs font-bold ${isSubmitted ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                         {isSubmitted ? 'SUBMITTED' : 'IN PROGRESS'}
                       </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{new Date(req.submissionDate).toLocaleDateString()}</span>
                 </div>

                 <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Details */}
                    <div className="lg:col-span-2 space-y-4">
                       <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">{req.requestDetails}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                             {req.requestTypes.map(t => <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">{t}</span>)}
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                          <div>
                             <span className="block text-xs font-bold uppercase text-slate-400">Requester</span>
                             <span className="text-slate-900 font-medium">{req.requesterName}</span>
                          </div>
                          <div>
                             <span className="block text-xs font-bold uppercase text-slate-400">Contact</span>
                             <span className="text-slate-900">{req.mobileNo}</span>
                          </div>
                       </div>

                       {task?.masterNotes && (
                         <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-xs font-bold text-amber-800 uppercase mb-1">Master Admin Note</p>
                            <p className="text-amber-900 text-sm italic">"{task.masterNotes}"</p>
                         </div>
                       )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-end space-y-3">
                        {isSubmitted ? (
                           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                              <CheckCircle2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                              <p className="text-sm font-bold text-purple-900">Work Uploaded</p>
                              <p className="text-xs text-purple-700 mb-3">Files sent to Master Drive</p>
                              <div className="flex gap-2 justify-center">
                                 <button onClick={() => handleEditSubmission(req)} className="p-2 bg-white text-slate-600 rounded-lg hover:text-indigo-600 border border-purple-200"><Edit2 className="w-4 h-4"/></button>
                                 <button onClick={() => handleDeleteSubmission(req)} className="p-2 bg-white text-slate-600 rounded-lg hover:text-red-600 border border-purple-200"><Trash2 className="w-4 h-4"/></button>
                                 <a href={task.driveFolderLink} target="_blank" rel="noreferrer" className="p-2 bg-white text-slate-600 rounded-lg hover:text-green-600 border border-purple-200"><ExternalLink className="w-4 h-4"/></a>
                              </div>
                           </div>
                        ) : (
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                             <p className="text-sm text-slate-500 mb-3">Ready to submit deliverables?</p>
                             <button 
                                onClick={() => { setSelectedRequest(req); setIsSubmitModalOpen(true); }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                             >
                                <UploadCloud className="w-5 h-5" /> Submit Work
                             </button>
                          </div>
                        )}
                    </div>
                 </div>
              </div>
            )})
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Assign Modal (Multi-Select) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Teams</h2>
              <p className="text-slate-500 text-sm mt-1">Select one or more teams for Request #{selectedRequest?.id}.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Select Teams</label>
                <div className="grid grid-cols-2 gap-3">
                  {[Role.DESIGN, Role.PR, Role.MEDIA_LAB, Role.SOCIAL_MEDIA].map(role => (
                    <button
                      key={role}
                      onClick={() => handleAssignRoleToggle(role)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        assignTargetRoles.includes(role)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${assignTargetRoles.includes(role) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                         {assignTargetRoles.includes(role) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-semibold text-sm">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Instructions</label>
                <textarea
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] text-sm p-3"
                  placeholder="Notes for the assigned teams..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => {setIsAssignModalOpen(false); setAssignTargetRoles([]);}} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-full transition-colors">Cancel</button>
              <button 
                onClick={handleAssign} 
                disabled={assignTargetRoles.length === 0}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Assign ({assignTargetRoles.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Modal (Enhanced with Simulated Upload) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Submit Deliverables</h2>
              <p className="text-slate-500 text-sm mt-1">Upload files to the Master Drive Storage.</p>
            </div>
            <div className="p-6 space-y-6">
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" /> Destination
                  </h4>
                  <p className="text-xs text-blue-900 font-mono break-all">
                    {settings.masterDriveLink.substring(0, 40)}...
                    <br/>
                    <span className="font-bold text-blue-700">/ {currentUser.role} / {new Date().toISOString().split('T')[0]} / Task_{selectedRequest?.id}</span>
                  </p>
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Files</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-slate-50"
                    placeholder="Link will be generated automatically..."
                    value={submissionLink}
                    readOnly
                  />
                  <button 
                    onClick={handleMockDriveUpload}
                    disabled={isUploading || submissionLink.length > 0}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold border transition-colors ${
                      submissionLink.length > 0 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {isUploading ? (
                       <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></span>
                    ) : submissionLink.length > 0 ? (
                       <CheckCircle2 className="w-5 h-5" />
                    ) : (
                       <>
                         <UploadCloud className="w-5 h-5" />
                         Upload
                       </>
                    )}
                  </button>
                </div>
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
      
      {/* View Details Modal Logic (kept same as previous but ensures open state works) */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* ... Same modal content as before, reusing logic ... */}
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
                  </div>
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-full transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;