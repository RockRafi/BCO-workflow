import { Request, RequestType, Role, Status, Task, User, HistoryLog } from '../types';

// Initial Mock Data
const MOCK_USERS: User[] = [
  { id: 1, username: 'master_admin', email: 'admin@diu.edu.bd', role: Role.MASTER, designation: 'Director BCO' },
  { id: 2, username: 'design_lead', email: 'design@diu.edu.bd', role: Role.DESIGN, designation: 'Senior Designer' },
  { id: 3, username: 'pr_officer', email: 'pr@diu.edu.bd', role: Role.PR, designation: 'PR Manager' },
  { id: 4, username: 'requester_1', email: 'faculty@diu.edu.bd', role: Role.EMPLOYEE, designation: 'Lecturer' },
  { id: 5, username: 'media_team', email: 'media@diu.edu.bd', role: Role.MEDIA_LAB, designation: 'Media Officer' },
];

const MOCK_REQUESTS: Request[] = [
  {
    id: 101,
    requesterName: 'Dr. Rahim',
    requesterEmail: 'rahim@diu.edu.bd',
    employeeID: 'EMP-001',
    officeName: 'CSE Department',
    extensionNo: '1234',
    mobileNo: '01711000000',
    requestTypes: [RequestType.DESIGN, RequestType.SOCIAL],
    requestDetails: 'Need a banner for the upcoming Hackathon. Size 10x6 ft. Theme: Cyberpunk.',
    status: Status.PENDING,
    submissionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    history: [
        { id: 1, action: 'Created', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), actorName: 'Dr. Rahim' }
    ]
  },
  {
    id: 102,
    requesterName: 'Ms. Fatima',
    requesterEmail: 'fatima@diu.edu.bd',
    employeeID: 'EMP-055',
    officeName: 'Admission Office',
    extensionNo: '5678',
    mobileNo: '01911000000',
    requestTypes: [RequestType.PR],
    requestDetails: 'Press release for Spring Admission 2025. Focus on new scholarships.',
    status: Status.ASSIGNED,
    submissionDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    history: [
        { id: 1, action: 'Created', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), actorName: 'Ms. Fatima' },
        { id: 2, action: 'Assigned', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), actorName: 'master_admin', details: 'Assigned to PR Team' }
    ]
  },
  {
    id: 103,
    requesterName: 'Mr. John',
    requesterEmail: 'john@diu.edu.bd',
    employeeID: 'EMP-102',
    officeName: 'Student Affairs',
    extensionNo: '9999',
    mobileNo: '01811000000',
    requestTypes: [RequestType.EVENT, RequestType.MEDIA],
    requestDetails: 'Photography coverage for the Cultural Fest. Video highlights needed.',
    status: Status.FINALIZED,
    submissionDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    history: [
        { id: 1, action: 'Created', timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), actorName: 'Mr. John' },
        { id: 2, action: 'Finalized', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), actorName: 'master_admin' }
    ]
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: 501,
    requestId: 102,
    assignedToRoleId: Role.PR,
    assignedByUserId: 1,
    masterNotes: 'Please coordinate with the Daily Star.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 502,
    requestId: 103,
    assignedToRoleId: Role.MEDIA_LAB,
    assignedByUserId: 1,
    masterNotes: 'Ensure 4K quality.',
    employeeSubmissionNotes: 'All photos uploaded to drive.',
    driveFolderLink: 'https://drive.google.com/drive/folders/xyz',
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

// Service Class
class MockDB {
  private requests: Request[];
  private tasks: Task[];
  private users: User[];

  constructor() {
    this.requests = [...MOCK_REQUESTS];
    this.tasks = [...MOCK_TASKS];
    this.users = [...MOCK_USERS];
  }

  // Simulation of Email Sending
  private sendEmail(to: string, subject: string, body: string) {
    console.log(`%c[EMAIL NOTIFICATION] To: ${to} | Subject: ${subject}`, 'color: #10b981; font-weight: bold;');
    console.log(`Body: ${body}`);
  }

  getRequests(): Request[] {
    // Hydrate requests with task info if needed
    return this.requests.map(req => ({
      ...req,
      tasks: this.tasks.filter(t => t.requestId === req.id)
    })).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }

  createRequest(req: Omit<Request, 'id' | 'status' | 'submissionDate' | 'history'>): Request {
    const newReq: Request = {
      ...req,
      id: Math.floor(Math.random() * 10000),
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
    
    // Notify Master Admin
    const master = this.users.find(u => u.role === Role.MASTER);
    if (master) {
      this.sendEmail(master.email, `New Request #${newReq.id}`, `A new request from ${newReq.requesterName} is pending approval.`);
    }
    // Notify Requester
    this.sendEmail(newReq.requesterEmail, `Request #${newReq.id} Received`, `We have received your request for: ${newReq.requestTypes.join(', ')}.`);

    return newReq;
  }

  assignTask(requestId: number, assignedBy: number, assignedToRole: Role, notes: string): Task {
    const request = this.requests.find(r => r.id === requestId);
    const assigner = this.users.find(u => u.id === assignedBy);

    if (request) {
      request.status = Status.ASSIGNED;
      request.history?.push({
        id: Math.random(),
        action: 'Assigned',
        timestamp: new Date().toISOString(),
        actorName: assigner?.username || 'Unknown',
        details: `Assigned to ${assignedToRole}`
      });
      
      this.sendEmail(request.requesterEmail, `Request #${request.id} Update`, `Your request has been assigned to the ${assignedToRole} team.`);
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
        req.history?.push({
            id: Math.random(),
            action: 'Work Submitted',
            timestamp: new Date().toISOString(),
            actorName: `${task.assignedToRoleId} Team`,
            details: 'Deliverables uploaded'
        });

        // Notify Master
        const master = this.users.find(u => u.role === Role.MASTER);
        if(master) this.sendEmail(master.email, `Work Submitted for #${req.id}`, `The ${task.assignedToRoleId} team has submitted work.`);
      }
    }
  }

  updateRequestStatus(requestId: number, status: Status) {
    const req = this.requests.find(r => r.id === requestId);
    if (req) req.status = status;
  }

  getUser(id: number) {
    return this.users.find(u => u.id === id);
  }
}

export const db = new MockDB();