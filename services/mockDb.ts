import { Request, RequestType, Role, Status, Task, User, HistoryLog, SystemSettings, Notification } from '../types';

// Default Data
const DEFAULT_USERS: User[] = [
  { id: 1, username: 'master_admin', email: 'admin@diu.edu.bd', password: 'admin', role: Role.MASTER, designation: 'Director BCO' },
  { id: 2, username: 'design_lead', email: 'design@diu.edu.bd', password: '123', role: Role.DESIGN, designation: 'Senior Designer' },
  { id: 3, username: 'pr_officer', email: 'pr@diu.edu.bd', password: '123', role: Role.PR, designation: 'PR Manager' },
  { id: 5, username: 'media_team', email: 'media@diu.edu.bd', password: '123', role: Role.MEDIA_LAB, designation: 'Media Officer' },
];

const DEFAULT_SETTINGS: SystemSettings = {
  masterDriveLink: '',
  masterNotificationEmail: 'admin@diu.edu.bd'
};

class MockDB {
  private requests: Request[] = [];
  private tasks: Task[] = [];
  private users: User[] = [];
  private notifications: Notification[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const storedRequests = localStorage.getItem('bco_requests');
      const storedTasks = localStorage.getItem('bco_tasks');
      const storedUsers = localStorage.getItem('bco_users');
      const storedSettings = localStorage.getItem('bco_settings');
      const storedNotifs = localStorage.getItem('bco_notifications');

      this.requests = storedRequests ? JSON.parse(storedRequests) : [];
      this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
      // Merge default users with stored users to ensure admin always exists if storage is corrupted
      const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      this.users = parsedUsers.length > 0 ? parsedUsers : DEFAULT_USERS;
      
      this.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
      this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [];
    } catch (e) {
      console.error("Failed to load from storage", e);
      // Fallback
      this.users = DEFAULT_USERS;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('bco_requests', JSON.stringify(this.requests));
    localStorage.setItem('bco_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('bco_users', JSON.stringify(this.users));
    localStorage.setItem('bco_settings', JSON.stringify(this.settings));
    localStorage.setItem('bco_notifications', JSON.stringify(this.notifications));
  }

  // --- SETTINGS & USERS ---
  getSettings(): SystemSettings { return this.settings; }

  updateSettings(newSettings: SystemSettings) {
    this.settings = newSettings;
    this.saveToStorage();
  }

  getUsers(): User[] { return this.users; }

  addUser(user: Omit<User, 'id'>) {
    const newUser = { ...user, id: Date.now() };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
    this.saveToStorage();
  }

  getUser(id: number) { return this.users.find(u => u.id === id); }

  authenticate(username: string, pass: string): User | undefined {
    return this.users.find(u => u.username === username && u.password === pass);
  }

  // --- REQUESTS ---
  getRequests(): Request[] {
    return this.requests.map(req => ({
      ...req,
      tasks: this.tasks.filter(t => t.requestId === req.id)
    })).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  createRequest(req: Omit<Request, 'id' | 'status' | 'submissionDate' | 'history'>): Request {
    const newReq: Request = {
      ...req,
      taskTitle: req.taskTitle || 'Untitled Request',
      id: Math.floor(Math.random() * 100000) + Date.now(), // Ensure unique ID
      status: Status.PENDING,
      submissionDate: new Date().toISOString(),
      history: [{
        id: Math.random(),
        action: 'Request Created',
        timestamp: new Date().toISOString(),
        actorName: req.requesterName,
        details: 'Submitted via Public Portal'
      }]
    };
    this.requests.unshift(newReq);
    this.addNotification(Role.MASTER, `New Request: ${newReq.taskTitle}`, 'info');
    this.saveToStorage();
    return newReq;
  }

  // --- TASKS ---
  assignTask(requestId: number, assignedBy: number, assignedToRole: Role, notes: string): Task {
    const request = this.requests.find(r => r.id === requestId);
    const assigner = this.users.find(u => u.id === assignedBy);

    if (request) {
      if (request.status !== Status.ASSIGNED) request.status = Status.ASSIGNED;
      
      this.logHistory(request.id, 'Task Assigned', assigner?.username || 'Admin', `Assigned to ${assignedToRole}`);
    }

    const newTask: Task = {
      id: Math.floor(Math.random() * 10000),
      requestId,
      assignedByUserId: assignedBy,
      assignedToRoleId: assignedToRole,
      masterNotes: notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    this.addNotification(assignedToRole, `New Task: ${request?.taskTitle}`, 'alert');
    this.saveToStorage();
    return newTask;
  }

  submitTask(taskId: number, driveLink: string, notes: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.driveFolderLink = driveLink;
      task.employeeSubmissionNotes = notes;
      task.updatedAt = new Date().toISOString();
      
      const req = this.requests.find(r => r.id === task.requestId);
      if (req) {
        req.status = Status.SUBMITTED;
        this.logHistory(req.id, 'Work Submitted', `${task.assignedToRoleId} Team`, 'Link added');
        this.addNotification(Role.MASTER, `Submission: ${req.taskTitle}`, 'success');
      }
      this.saveToStorage();
    }
  }

  deleteTaskSubmission(taskId: number) {
     const task = this.tasks.find(t => t.id === taskId);
     if (task) {
        task.driveFolderLink = undefined;
        task.employeeSubmissionNotes = undefined;
        this.saveToStorage();
     }
  }

  // --- HISTORY & NOTIFICATIONS ---

  logHistory(requestId: number, action: string, actor: string, details?: string) {
    const req = this.requests.find(r => r.id === requestId);
    if (req) {
        if (!req.history) req.history = [];
        req.history.unshift({
            id: Date.now() + Math.random(),
            action,
            timestamp: new Date().toISOString(),
            actorName: actor,
            details
        });
        this.saveToStorage();
    }
  }

  // Get aggregated history for the dashboard view
  getAllHistory(userRole: Role): HistoryLog[] {
    let allHistory: HistoryLog[] = [];
    
    this.requests.forEach(req => {
        // Filter: Master sees all, Employees see none (usually), Teams see their assignments
        const relevant = userRole === Role.MASTER 
            ? true 
            : this.tasks.some(t => t.requestId === req.id && t.assignedToRoleId === userRole);

        if (relevant && req.history) {
            allHistory = [...allHistory, ...req.history.map(h => ({...h, requestId: req.id, taskTitle: req.taskTitle}))];
        }
    });

    return allHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addNotification(role: Role, message: string, type: 'info' | 'success' | 'alert') {
    this.notifications.unshift({
      id: Date.now() + Math.random(),
      recipientRoleId: role,
      message,
      isRead: false,
      timestamp: new Date().toISOString(),
      type
    });
    this.saveToStorage();
  }

  getNotifications(role: Role): Notification[] {
    return this.notifications.filter(n => n.recipientRoleId === role || n.recipientRoleId === 'ALL');
  }

  markNotificationRead(id: number) {
    const n = this.notifications.find(n => n.id === id);
    if (n) { n.isRead = true; this.saveToStorage(); }
  }
}

export const db = new MockDB();