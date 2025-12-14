# BCO Workflow Manager

## Overview

The **BCO Workflow Manager** is a comprehensive, digital solution designed for the **Branding & Communications Office (BCO)** of **Daffodil International University**. This system streamlines the complex workflow of managing creative requests—ranging from graphic design and videography to public relations and event coverage.

It replaces manual coordination with a centralized platform where faculty and staff can submit requests, and the Master Admin can efficiently assign, track, and approve work across specialized sub-teams (Design, Media Lab, PR, Social Media).

## Key Features

### 🚀 Public Request Portal
*   **User-Friendly Form:** A clean, responsive interface for university staff to submit work requests.
*   **Multi-Select Categories:** Support for complex requests involving multiple departments (e.g., Design + Social Media).
*   **Contact Integration:** Capture of essential contact details (Mobile, Extension) for rapid coordination.

### 🛡️ Role-Based Dashboards
*   **Master Admin:** 
    *   Global view of all incoming requests.
    *   "assign-to" functionality to delegate tasks to specific teams.
    *   Approval workflows and status monitoring.
*   **Sub-Teams (Design, Media, PR):** 
    *   Focused view of assigned tasks.
    *   Submission interface to upload deliverables (Google Drive integration) and notes.
    *   Status updates.

### ⚡ Operational Efficiency
*   **Real-time Status Tracking:** Visual badges (Pending, Assigned, Submitted, Finalized).
*   **Request History:** Detailed timeline logging every action (Creation, Assignment, Submission) for accountability.
*   **Smart Filtering:** Search by ID, Name, or Office, and filter by Status.
*   **Notification System:** (Simulated) Email alerts for assignments and approvals.

## Technical Architecture & Implementation Details

This project is built using **React 19** and **TypeScript**, utilizing a robust **Service-Repository Pattern** to manage state and business logic. While currently running on the client-side, the data structure is designed to mirror a standard **PHP/MySQL** backend architecture.

### 1. Data Models (`types.ts`)
The application relies on strictly typed interfaces to ensure data integrity:
*   **Request:** The parent entity containing metadata (Title, Requester Info, Deadline) and the aggregate `Status` (e.g., `PENDING`, `FINALIZED`).
*   **Task:** A child entity representing a specific unit of work assigned to a team (Foreign Key: `requestId`). It stores submission links and `masterFeedback` for revisions.
*   **HistoryLog:** An audit trail entity that records `timestamp`, `actor`, and `action` for every state change.

### 2. Service Layer (`services/mockDb.ts`)
The `MockDB` class functions as the API Controller and Database Abstraction Layer.

#### Core Methods:
*   **`createRequest(req: Request)`**: 
    *   Accepts form data from the Public Portal.
    *   Generates a unique ID.
    *   Initializes the workflow with `Status.PENDING`.
    *   **PHP Equivalent:** `INSERT INTO requests (...) VALUES (...)`.

*   **`assignTask(requestId, role, notes)`**:
    *   Creates a new `Task` object linked to the Request.
    *   Updates the Request status to `ASSIGNED`.
    *   Triggers a notification for the specific Role.
    *   **PHP Equivalent:** Transaction wrapping `INSERT INTO tasks` and `UPDATE requests`.

*   **`submitTask(taskId, link, notes)`**:
    *   Called by Sub-teams.
    *   Updates the `Task` with the drive link.
    *   Updates the parent Request status to `SUBMITTED`.
    *   **Logic:** Signals the Master Admin that work is ready for review.

*   **`reviewTask(taskId, action, feedback)`**:
    *   **Action: APPROVE**: Sets Request status to `FINALIZED`.
    *   **Action: REJECT**: Sets Request status to `CHANGES_REQUESTED` and saves `feedback` into the Task.
    *   **Logic:** This enables the loop where sub-teams see feedback and can re-submit the same task.

*   **`getRequests()`**:
    *   Performs an in-memory "Left Join" of Requests and Tasks.
    *   Returns a unified object graph for the Dashboard view.

### 3. Persistence Strategy
*   **LocalStorage:** The `MockDB` service serializes the entire state tree to JSON and saves it to the browser's `localStorage` on every write operation. 
*   **Rehydration:** On application load, `loadFromStorage()` parses the JSON to restore the session state, ensuring data persists across page refreshes.

## Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **UI Components:** Lucide React (Icons), Custom Material 3 implementations
*   **State Management:** React Hooks & Service Class
*   **Backend Simulation:** In-memory Mock DB service

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/bco-workflow-manager.git
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

## Project Structure

*   `/components`: Reusable UI components (Dashboard, Layout, Forms).
*   `/services`: Data layer and business logic (MockDB).
*   `/types`: TypeScript definitions for robust type safety.

---
*Developed for Daffodil International University*