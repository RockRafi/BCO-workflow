import { Request, RequestType, Role, Status, Task, User, HistoryLog, SystemSettings, Notification } from '../types';

// Default Data for Reset/Init
const DEFAULT_USERS: User[] = [
  { id: 1, username: 'master_admin', email: 'admin@diu.edu.bd', password: 'admin', role: Role.MASTER, designation: 'Director BCO' },
  { id: 2, username: 'design_lead', email: 'design@diu.edu.bd', password: '123', role: Role.DESIGN, designation: 'Senior Designer' },
  { id: 3, username: 'pr_officer', email: 'pr@diu.edu.bd', password: '123', role: Role.PR, designation: 'PR Manager' },
  { id: 5, username: 'media_team', email: 'media@diu.edu.bd', password: '123', role: Role.MEDIA_LAB, designation: 'Media Officer' },
];

const DEFAULT_SETTINGS: SystemSettings = {
  masterDriveLink: 'https://drive.google.com/drive/folders/10W8ljDfwvv_-JJd-uHnp2M2N5a3S3MOw?usp=sharing',
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

    const storedRequests = localStorage.getItem('bco_requests');
    const storedTasks = localStorage.getItem('bco_tasks');
    const storedUsers = localStorage.getItem('bco_users');
    const storedSettings = localStorage.getItem('bco_settings');
    const storedNotifs = localStorage.getItem('bco_notifications');

    this.requests = storedRequests ? JSON.parse(storedRequests) : [];
    this.tasks = storedTasks ? JSON.parse(storedTasks) : [];
    this.users = storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS;
    this.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
    this.notifications = storedNotifs ? JSON.parse(storedNotifs) : [];
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

  getSettings(): SystemSettings {
    return this.settings;
  }

  updateSettings(newSettings: SystemSettings) {
    this.settings = newSettings;
    this.saveToStorage();
  }

  getUsers(): User[] {
    return this.users;
  }

  addUser(user: Omit<User, 'id'>) {
    const newUser = { ...user, id: Date.now() };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  updateUser(id: number, data: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...data };
      this.saveToStorage();
    }
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
    this.saveToStorage();
  }

  // --- REQUESTS ---

  getRequests(): Request[] {
    // Hydrate requests with task info
    return this.requests.map(req => ({
      ...req,
      tasks: this.tasks.filter(t => t.requestId === req.id)
    })).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  createRequest(req: Omit<Request, 'id' | 'status' | 'submissionDate' | 'history'>): Request {
    const newReq: Request = {
      ...req,
      id: Math.floor(Math.random() * 100000),
      status: Status.PENDING,
      submissionDate: new Date().toISOString(),
      history: [{
        id: Math.random(),
        action: 'Created',
        timestamp: new Date().toISOString(),
        actorName: req.requesterName
      }]
    };
    this.requests.unshift(newReq);
    
    // Notify Master
    this.addNotification(Role.MASTER, `New Request #${newReq.id} from ${newReq.requesterName}`, 'info');
    
    this.saveToStorage();
    return newReq;
  }

  // --- TASKS ---

  assignTask(requestId: number, assignedBy: number, assignedToRole: Role, notes: string): Task {
    const request = this.requests.find(r => r.id === requestId);
    const assigner = this.users.find(u => u.id === assignedBy);

    if (request) {
      // Don't overwrite if already assigned to others, just update status
      if (request.status !== Status.ASSIGNED) {
         request.status = Status.ASSIGNED;
      }
      
      request.history?.push({
        id: Math.random(),
        action: 'Assigned',
        timestamp: new Date().toISOString(),
        actorName: assigner?.username || 'Unknown',
        details: `Assigned to ${assignedToRole}`
      });
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
    
    // Notify Team
    this.addNotification(assignedToRole, `New Task Assigned: Request #${requestId}`, 'alert');
    
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
        // Check if all tasks are submitted? For now just set to Submitted
        req.status = Status.SUBMITTED;
        req.history?.push({
            id: Math.random(),
            action: 'Work Submitted',
            timestamp: new Date().toISOString(),
            actorName: `${task.assignedToRoleId} Team`,
            details: 'Deliverables uploaded to Drive'
        });

        // Notify Master
        this.addNotification(Role.MASTER, `Work Submitted for #${req.id} by ${task.assignedToRoleId}`, 'success');
        
        // Simulate Email to Master
        console.log(`Sending email to ${this.settings.masterNotificationEmail}: Work Submitted for #${req.id}`);
      }
      this.saveToStorage();
    }
  }

  deleteTaskSubmission(taskId: number) {
     const task = this.tasks.find(t => t.id === taskId);
     if (task) {
        task.driveFolderLink = undefined;
        task.employeeSubmissionNotes = undefined;
        // Optionally revert status if all tasks are un-submitted
        this.saveToStorage();
     }
  }

  // --- NOTIFICATIONS ---

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
    if (n) { 
        n.isRead = true; 
        this.saveToStorage();
    }
  }

  getUser(id: number) {
    return this.users.find(u => u.id === id);
  }

  authenticate(username: string, pass: string): User | undefined {
    // Simple plain text check for mock
    return this.users.find(u => u.username === username && u.password === pass);
  }
}

export const db = new MockDB();