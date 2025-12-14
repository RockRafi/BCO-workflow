import React, { useState, useEffect } from 'react';
import { Request, Task, Role, Status, RequestType, Notification, User } from '../types';
import { db } from '../services/mockDb';
import { 
  Clock, CheckCircle2, AlertCircle, FileText, ChevronRight, MoreHorizontal, Send, 
  ExternalLink, Calendar, Eye, UserPlus, X, UploadCloud, Link as LinkIcon, 
  Filter, Search, History, Bell, Edit2, Trash2, FolderOpen, Activity, PlayCircle
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
}

type ViewMode = 'TASKS' | 'HISTORY';

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('TASKS');
  const [requests, setRequests] = useState<Request[]>([]);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
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
  const [assignTargetRoles, setAssignTargetRoles] = useState<Role[]>([]);
  
  // Submission State
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  useEffect(() => {
    refreshData();
  }, [currentUser, isAssignModalOpen, isSubmitModalOpen]); 

  // --- DATA REFRESH ---
  const refreshData = () => {
    const allRequests = db.getRequests();
    setNotifications(db.getNotifications(currentUser.role));
    setHistoryLogs(db.getAllHistory(currentUser.role));
    
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
        r.officeName.toLowerCase().includes(lower) ||
        (r.taskTitle && r.taskTitle.toLowerCase().includes(lower))
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

  const markRead = (id: number) => {
      db.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? {...n, isRead: true} : n));
  };

  // --- HELPER UI ---

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

  const getNotificationIcon = (type: string) => {
    switch(type) {
        case 'info': return <PlayCircle className="w-5 h-5 text-blue-500" />;
        case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'alert': return <AlertCircle className="w-5 h-5 text-amber-500" />;
        default: return <Bell className="w-5 h-5 text-slate-500" />;
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
        
        <div className="flex items-center gap-4">
             {/* View Mode Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('TASKS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'TASKS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                >
                  Tasks
                </button>
                <button 
                  onClick={() => setViewMode('HISTORY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'HISTORY' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                >
                  History
                </button>
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
                            <button onClick={() => setNotifications([])} className="text-xs text-indigo-600 hover:underline">Clear</button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="p-4 text-center text-xs text-slate-400">No notifications</p>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => markRead(n.id)} className={`p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/50' : ''}`}>
                                        <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                                        <div>
                                            <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                                            <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      {/* --- STATS (Master Only - Original) --- */}
      {currentUser.role === Role.MASTER && viewMode === 'TASKS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.status === Status.PENDING).length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Approved Today</p>
                <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.status === Status.ASSIGNED).length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Event Support</p>
                <p className="text-2xl font-bold text-slate-900">{requests.filter(r => r.requestTypes.includes(RequestType.EVENT)).length}</p>
              </div>
            </div>
          </div>
      )}
      
      {/* --- CONTENT --- */}
      
      {viewMode === 'HISTORY' ? (
         <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" /> Recent Activity Log
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {historyLogs.map((log, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 group-[.is-active]:bg-indigo-600 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-slate-900">{log.action}</div>
                                <time className="font-mono text-xs font-medium text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</time>
                            </div>
                            <div className="text-slate-500 text-sm">
                                <span className="font-semibold text-indigo-600">{log.actorName}</span> • {log.details}
                                {log.taskTitle && <div className="mt-1 text-xs bg-slate-100 inline-block px-2 py-1 rounded text-slate-600">{log.taskTitle}</div>}
                            </div>
                        </div>
                    </div>
                ))}
                {historyLogs.length === 0 && <p className="text-center text-slate-400 py-10">No history available yet.</p>}
            </div>
         </div>
      ) : (
        <>
        {/* --- FILTERS --- */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 focus:outline-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Status</option>
                    {Object.values(Status).map(s => (
                    <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button onClick={refreshData} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    Refresh
                </button>
            </div>
        </div>

        {/* --- CARDS LAYOUT (Original Style) --- */}
        <div className="grid grid-cols-1 gap-6">
            {filteredRequests.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                    <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Tasks Found</h3>
                    <p className="text-slate-500">Try adjusting your filters.</p>
                </div>
            ) : (
                filteredRequests.map(req => {
                    const task = req.tasks?.find(t => t.assignedToRoleId === currentUser.role);
                    const isSubmitted = !!task?.driveFolderLink || req.status === Status.SUBMITTED;
                    
                    return (
                        <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* Card Header */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-white border border-slate-200 text-slate-500 text-xs font-mono px-2 py-1 rounded">#{req.id}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{new Date(req.submissionDate).toLocaleDateString()}</span>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Details */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 leading-snug">{req.taskTitle}</h3>
                                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{req.requestDetails}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
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
                                     <div className="flex -space-x-2 justify-center lg:justify-end mb-4 lg:mb-0">
                                        {req.tasks && req.tasks.length > 0 ? (
                                            req.tasks.map((t, idx) => (
                                                <div key={idx} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={t.assignedToRoleId}>
                                                    {t.assignedToRoleId.substring(0,2)}
                                                </div>
                                            ))
                                        ) : <span className="text-xs text-slate-400">Unassigned</span>}
                                    </div>

                                    {currentUser.role === Role.MASTER && req.status === Status.PENDING ? (
                                        <button 
                                            onClick={() => { setSelectedRequest(req); setIsAssignModalOpen(true); }}
                                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserPlus className="w-5 h-5" /> Assign Team
                                        </button>
                                    ) : (
                                       <>
                                        {isSubmitted ? (
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                                                <CheckCircle2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-purple-900">Work Submitted</p>
                                                <div className="flex gap-2 justify-center mt-3">
                                                    <button onClick={() => handleEditSubmission(req)} className="p-2 bg-white text-slate-600 rounded-lg hover:text-indigo-600 border border-purple-200"><Edit2 className="w-4 h-4"/></button>
                                                    <button onClick={() => handleDeleteSubmission(req)} className="p-2 bg-white text-slate-600 rounded-lg hover:text-red-600 border border-purple-200"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        ) : currentUser.role !== Role.MASTER && currentUser.role !== Role.EMPLOYEE && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                                                <p className="text-sm text-slate-500 mb-3">Ready to submit?</p>
                                                <button 
                                                    onClick={() => { setSelectedRequest(req); setIsSubmitModalOpen(true); }}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <UploadCloud className="w-5 h-5" /> Submit Work
                                                </button>
                                            </div>
                                        )}
                                       </> 
                                    )}
                                    <button 
                                        onClick={() => { setSelectedRequest(req); setIsViewModalOpen(true); }}
                                        className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
        </>
      )}

      {/* --- MODALS --- */}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Assign Teams</h2>
              <p className="text-slate-500 text-sm mt-1">Select teams for <span className="font-bold text-slate-800">"{selectedRequest?.taskTitle}"</span>.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Select Teams</label>
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
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${assignTargetRoles.includes(role) ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                         {assignTargetRoles.includes(role) && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-semibold text-sm">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Instructions</label>
                <textarea
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] text-sm p-3"
                  placeholder="Notes for the assigned teams..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => {setIsAssignModalOpen(false); setAssignTargetRoles([]);}} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={handleAssign} 
                disabled={assignTargetRoles.length === 0}
                className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Assign Tasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Work Modal (Link Only) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Submit Deliverables</h2>
              <p className="text-slate-500 text-sm mt-1">Provide access link for <span className="font-semibold">"{selectedRequest?.taskTitle}"</span>.</p>
            </div>
            <div className="p-6 space-y-6">
               
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                  <p className="font-bold flex items-center gap-2 mb-1"><LinkIcon className="w-4 h-4"/> Submission Method</p>
                  <p>Please upload your files to Vercel Storage, Google Drive, or Dropbox and paste the shareable link below.</p>
               </div>

               <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">File / Folder Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="url"
                        placeholder="https://..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                    />
                  </div>
               </div>

               <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Submission Notes</label>
                <textarea
                    className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none min-h-[100px] text-sm p-3"
                    placeholder="Describe the work done..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                />
               </div>

            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button onClick={() => setIsSubmitModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={handleSubmitWork} 
                disabled={!submissionLink}
                className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Submit Work
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View Details Modal (Full Info) */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-slate-200 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded">#{selectedRequest.id}</span>
                    <span className="text-slate-400 text-sm">|</span>
                    <span className="text-slate-500 text-sm">{new Date(selectedRequest.submissionDate).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Main Content */}
                   <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedRequest.taskTitle}</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedRequest.requestTypes.map(t => (
                                    <span key={t} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-bold uppercase">{t}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Description</h4>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedRequest.requestDetails}</p>
                        </div>

                        {selectedRequest.tasks?.map(task => (
                            task.driveFolderLink && (
                                <div key={task.id} className="bg-green-50 rounded-2xl p-6 border border-green-100">
                                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Submission from {task.assignedToRoleId}</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <a href={task.driveFolderLink} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-medium break-all">{task.driveFolderLink}</a>
                                        <ExternalLink className="w-3 h-3 text-green-500" />
                                    </div>
                                    {task.employeeSubmissionNotes && <p className="text-sm text-green-800 italic">"{task.employeeSubmissionNotes}"</p>}
                                </div>
                            )
                        ))}
                   </div>

                   {/* Sidebar Info */}
                   <div className="space-y-6">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Info</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Requester</p>
                                    <p className="font-semibold text-slate-800">{selectedRequest.requesterName}</p>
                                    <p className="text-xs text-slate-500">{selectedRequest.requesterEmail}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Mobile</p>
                                        <p className="font-medium text-slate-800 text-sm">{selectedRequest.mobileNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Ext.</p>
                                        <p className="font-medium text-slate-800 text-sm">{selectedRequest.extensionNo}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Department</p>
                                    <p className="font-medium text-slate-800 text-sm">{selectedRequest.officeName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Employee ID</p>
                                    <p className="font-medium text-slate-800 text-sm">{selectedRequest.employeeID}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Teams</h4>
                            <div className="space-y-2">
                                {selectedRequest.tasks && selectedRequest.tasks.length > 0 ? (
                                    selectedRequest.tasks.map(t => (
                                        <div key={t.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                {t.assignedToRoleId.substring(0,2)}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{t.assignedToRoleId}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No teams assigned</p>
                                )}
                            </div>
                        </div>
                   </div>
               </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors shadow-sm">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;