# Campus Service Request Management System

**Course:** IS305 – Object-Oriented Programming
**Assessment:** AT3 Major Project
**Student:** Vincent MALA
**Student ID:** 220541
**GitHub Repository:** https://github.com/meverickmala-cpu/IS305-DWU220541.git

## Project Description

The Campus Service Request Management System is a Node.js console application
that replaces informal, untracked methods (phone calls, verbal reports,
handwritten notes) of reporting campus issues with a structured digital
system. It allows students and staff to submit, track, and manage service
requests across four categories: ICT Support, Facilities Maintenance,
Cleaning and Sanitation, and General Campus Service.

## Achievement Components Attempted

- [x] Pass (25 marks) – Core classes, request workflow, validation
- [x] Credit (10 marks) – Inheritance, specialised requests, role workflows
- [x] Distinction (15 marks) – Polymorphism, JSON persistence, reports, tests

## Project Folder Structure

```
AT3_CampusServiceRequestSystem/
├── src/                # Application source code (classes, repositories, app entry point)
├── data/                # JSON data files (users, serviceRequests, requestHistory, auditLog)
├── docs/                # Requirements, UML diagrams, technical docs, user guide, test report
├── tests/               # Automated test files (Node.js test runner)
├── package.json
├── package-lock.json
└── README.md
```

See `docs/` for the full requirements document, UML diagrams, technical
documentation, user guide and test report.

## Installation Requirements

- Node.js (v18 or later recommended)
- npm

## Setup Instructions

```
npm install
```

## Running the Application

```
node src/CampusServiceApp.js
```

## Running Tests

```
npm test
```

## Features Completed

- Full Pass-level workflow: register, submit, view, update, cancel, search, summary.
- Credit-level role workflow: review, assign Technician, begin work, record
  progress, resolve, close - each step enforcing role permissions and a
  controlled status sequence, with a full per-request history.
- User inheritance (StudentRequester, StaffRequester, ServiceOfficer,
  Technician) and request inheritance (ICTSupportRequest,
  MaintenanceRequest, CleaningRequest, GeneralServiceRequest), all via
  constructor chaining.
- Distinction-level polymorphism, an abstract-style ServiceRequest base
  class, JSON file persistence via dedicated repository classes, object
  restoration via factories, a system-wide audit trail, four management
  reports, and 13 automated tests (`npm test`).

## Known Limitations

- Single-session console application - no concurrent multi-user access.
- No password-based authentication; a user is identified by User ID only.
- Priority scoring and target resolution hours use simple, illustrative
  rules rather than a configurable policy engine.

## Future Improvements

- A configuration file for priority scoring rules and target resolution
  hours per category.
- Pagination for "View All Requests" once the dataset grows large.
- A notifications feature (e.g. alerting a Technician when a new request
  is assigned).

## Sample Data

`data/` ships with simulated sample data (6 users across all roles, 5
requests spanning all four categories and several different statuses,
including a completed and a cancelled request) so the application and
its reports can be explored immediately without registering everything
from scratch. All data is fictional.

## AI Use Declaration

Claude (Anthropic) was used during this project as a development
assistant: drafting and iterating on class implementations from my own
design decisions and the assessment brief, generating UML diagrams
reflecting the final code, drafting documentation, and writing/running
automated tests. All resulting code and documentation was reviewed,
tested, and understood by me before submission, and I am able to
explain and defend every part of it.
