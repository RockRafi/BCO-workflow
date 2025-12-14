export enum Role {
  MASTER = 'Master',
  PR = 'PR',
  MEDIA_LAB = 'MediaLab',
  DESIGN = 'Design',
  SOCIAL_MEDIA = 'SocialMedia',
  EMPLOYEE = 'Employee' // Requester
}

export enum RequestType {
  MEDIA = 'Media',
  DESIGN = 'Design',
  EVENT = 'Event',
  PR = 'PR',
  SOCIAL = 'Social'
}

export enum Status {
  PENDING = 'Pending',
  APPROVED_BY_MASTER = 'ApprovedByMaster',
  ASSIGNED = 'Assigned',
  SUBMITTED = 'Submitted',
  CHANGES_REQUESTED = 'ChangesRequested',
  FINALIZED = 'Finalized',
  REJECTED = 'Rejected'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  designation: string;
}

export interface Request {
  id: number;
  requesterName: string;
  requesterEmail: string;
  employeeID: string;
  officeName: string;
  extensionNo: string; // Added
  mobileNo: string;    // Added
  requestTypes: RequestType[]; // Changed from single to array
  requestDetails: string;
  status: Status;
  submissionDate: string; // ISO Date string
  tasks?: Task[]; 
  history?: HistoryLog[]; // Added for timeline
}

export interface HistoryLog {
  id: number;
  action: string;
  timestamp: string;
  actorName: string;
  details?: string;
}

export interface Task {
  id: number;
  requestId: number;
  assignedToRoleId: Role;
  assignedByUserId: number;
  masterNotes?: string;
  employeeSubmissionNotes?: string;
  driveFolderLink?: string;
  createdAt: string;
  updatedAt: string;
}