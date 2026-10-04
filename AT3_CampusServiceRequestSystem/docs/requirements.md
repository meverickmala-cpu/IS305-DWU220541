# Requirements Document

## Project Background

See `docs/problem-statement.md` for full background and problem statement.

## Actors and User Roles

| Actor | Responsibilities |
|---|---|
| Student or Staff Requester | Submit requests, view progress, update eligible requests, cancel requests |
| Service Officer | Review requests, set priority, assign Technicians, verify completion |
| Technician | View assigned requests, add progress notes, resolve service requests |
| System Administrator | Review system records, audit history, management reports |

## Functional Requirements

1. The system shall allow a Requester to register with a user ID, first
   name, last name, email address, and user type.
2. The system shall allow a Requester to submit a service request with a
   title, description, campus location, and category (ICT Support,
   Facilities Maintenance, Cleaning and Sanitation, General Campus Service).
3. The system shall set the default status of a new request to Submitted.
4. The system shall allow a Requester to view their own requests.
5. The system shall allow a Requester to update or cancel only their own
   Submitted requests.
6. The system shall allow a Service Officer to review a request and assign
   a priority level.
7. The system shall allow a Service Officer to assign a Technician to a
   request.
8. The system shall allow an assigned Technician to begin work, record
   progress notes, and resolve a request.
9. The system shall allow a Service Officer to verify and close a Resolved
   request.
10. The system shall enforce the status flow: Submitted → Reviewed →
    Assigned → In Progress → Resolved → Closed (Cancelled is a final
    status reachable only from Submitted).
11. The system shall allow searching requests by ID or title, and
    filtering by category, status, priority, or assigned Technician.
12. The system shall allow sorting requests by date submitted or priority.
13. The system shall maintain a history entry for every status-changing
    action on a request.
14. The system shall persist users, requests, request history, and audit
    log entries to JSON files and reload them on startup (Distinction).
15. The system shall generate management reports summarising requests by
    status, category, priority, Technician, and campus location
    (Distinction).

## Non-Functional Requirements

1. The application shall run as a Node.js console (command-line)
   application with no external database.
2. The application shall validate all user input and reject invalid data
   with clear error messages rather than crashing.
3. The application shall enforce role-based permissions so that only
   authorised roles can perform restricted actions (e.g. only a Service
   Officer can assign a Technician).
4. The application's source code shall be organised into separate classes
   with clear, single responsibilities (encapsulation, separation of
   concerns).
5. The application shall be accompanied by automated tests covering core
   and extended functionality.
6. The application's data files shall contain only simulated data, with no
   passwords or real institutional records.

## Assumptions and Limitations

- Only one instance of the application runs at a time; concurrent access
  by multiple users simultaneously is out of scope.
- User authentication is limited to selecting/registering a user ID; there
  is no password-based login.
- The system is a prototype for assessment purposes and is not intended
  for live institutional deployment.

## User Stories

1. As a student, I want to submit a service request for a broken air
   conditioner so that facilities staff can fix it.
2. As a staff member, I want to view the status of my submitted request
   so that I know whether it has been actioned.
3. As a student, I want to cancel a request I submitted by mistake so
   that it is removed from the active queue.
4. As a Service Officer, I want to review incoming requests and set their
   priority so that urgent issues are handled first.
5. As a Service Officer, I want to assign a Technician to a request so
   that the right person handles the right type of issue.
6. As a Technician, I want to view only the requests assigned to me so
   that I can focus on my own workload.
7. As a Technician, I want to record progress notes and resolve a request
   so that the requester and Service Officer know the work is done.
8. As a Service Officer, I want to verify and close a resolved request so
   that only confirmed completions are marked closed.
9. As a System Administrator, I want to view reports of requests by
   category and status so that I can monitor overall campus service
   performance.
10. As a System Administrator, I want to see an audit trail of actions on
    a request so that I can investigate disputes or delays.
