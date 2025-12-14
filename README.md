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

## Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **UI Components:** Lucide React (Icons), Custom Material 3 implementations
*   **State Management:** React Hooks
*   **Backend Simulation:** In-memory Mock DB service (Architecture designed for PHP/MySQL integration)

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
