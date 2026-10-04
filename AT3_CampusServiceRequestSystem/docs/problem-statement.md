# Problem Statement, Objectives and Scope

## Project Background

Students and staff currently report ICT problems, damaged facilities,
cleaning needs, and other campus service issues through informal channels
such as telephone calls, verbal conversations, or handwritten notes. This
informal approach lacks structure and accountability.

## Problem Statement

Because requests are not recorded in a consistent, trackable format, it is
difficult to track requests, assign responsibility, monitor progress, or
confirm whether a reported problem has actually been resolved. This creates
delays, lost requests, and no accountability trail for campus service
issues.

## Project Objectives

- Provide a structured way for students and staff to submit campus service
  requests.
- Enable Service Officers to review, prioritise, and assign requests to
  Technicians.
- Enable Technicians to record progress and resolve assigned requests.
- Maintain a full history/audit trail of actions taken on each request.
- Provide reporting capability so management can monitor request volume,
  status, and resolution performance.

## Project Scope

**In scope:**
- Console-based (Node.js) application covering the full request lifecycle:
  registration, submission, review, assignment, progress tracking,
  resolution, and closure.
- Four request categories: ICT Support, Facilities Maintenance, Cleaning
  and Sanitation, General Campus Service.
- Four user roles: Student/Staff Requester, Service Officer, Technician,
  System Administrator.
- Data persistence to JSON files (Distinction level).

**Out of scope:**
- Any graphical user interface or web interface.
- Any database technology (MongoDB, MySQL, SQLite, etc.).
- Real institutional data or live deployment.

## Actors and User Roles

*(to be expanded in the full requirements document — see docs/requirements.md)*

- Student or Staff Requester
- Service Officer
- Technician
- System Administrator
