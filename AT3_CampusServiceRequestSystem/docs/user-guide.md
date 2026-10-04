# User Guide

## Installation Requirements

- Node.js v18 or later (no external npm packages are required - the project
  uses only Node's built-in modules).
- npm (for running the `npm test` script).

## Setup Instructions

1. Unzip the submitted project, or clone the GitHub repository.
2. Open a terminal in the `AT3_CampusServiceRequestSystem` folder.
3. Run:
   ```
   npm install
   ```
   (There are no external dependencies, so this simply confirms the
   project is set up correctly.)

## How to Start the Application

```
node src/CampusServiceApp.js
```
or
```
npm start
```

On startup, the application loads any existing data from the `data/`
folder (or starts empty if the files don't exist yet) and shows the main
menu.

## How to Register or Select a User

Choose **1. Register User** from the menu, then enter the requested
details. The application will ask for extra details depending on the
user type you choose:

| User Type | Extra details asked |
|---|---|
| StudentRequester | Programme, Year level |
| StaffRequester | Department |
| ServiceOfficer | Service section |
| Technician | Technical speciality |
| Administrator | (none) |

There is no login step - for every other action you simply type the
User ID of the person performing it (e.g. "Your User ID:") each time
you're prompted.

## How to Submit a Request

Choose **2. Submit Service Request**, enter your User ID, then the
request details. The category you choose decides which extra questions
are asked:

- **ICT Support** → Device type, System name, Fault type, Network impact
- **Facilities Maintenance** → Building, Room number, Hazard level, Equipment affected
- **Cleaning and Sanitation** → Cleaning area, Hygiene risk, Service type, Preferred service time
- **General Campus Service** → no extra details

## How to Assign and Process a Request

This follows the controlled workflow in order:

1. **10. Review Request** (Service Officer) - sets the priority, moves the request to *Reviewed*.
2. **11. Assign Technician** (Service Officer) - moves the request to *Assigned*.
3. **12. Begin Work** (Technician who was assigned) - moves the request to *In Progress*.
4. **13. Record Progress** (assigned Technician) - adds a note without changing status.
5. **14. Resolve Request** (assigned Technician) - moves the request to *Resolved*.
6. **15. Close Request** (Service Officer) - moves the request to *Closed*.

Each step will reject the wrong role or an out-of-order status with a
clear error message.

## How to Search, Filter, Sort and Generate Reports

- **8. Search Requests** - matches by request ID or title.
- **16. Filter Requests** - by category, status, priority, or assigned Technician.
- **17. Sort Requests** - by date submitted or by priority score.
- **18. View Request History** - the full audit trail for one request.
- **19. View Management Reports** - requests by status, by category, by
  campus location, and average resolution time.
- **20. View Audit Log** - every recorded system action.

## Example Console Screenshots

Example: submitting an ICT Support request (console output):

```
Select an option: 2
Your User ID: DWU2026001
Request title: Wi-Fi down
Description: Cannot connect
Campus location: Library L2
Categories: ICT Support, Facilities Maintenance, Cleaning and Sanitation, General Campus Service
Category: ICT Support
Priorities: Low, Medium, High, Urgent
Priority: Medium
Device type: Laptop
System name: Campus Wi-Fi
Fault type: Connectivity
Network impact: Campus-wide outage
Request submitted successfully with ID: REQ001
```

Example: viewing management reports (console output):

```
--- Requests by Status ---
Closed: 1

--- Requests by Category ---
ICT Support: 1

--- Request Volume by Campus Location ---
Library L2: 1

--- Average Resolution Time ---
0.01 hours (across Resolved/Closed requests)
```

## Common Errors and Solutions

| Error message | Cause | Solution |
|---|---|---|
| "No user found with that ID. Please register first." | You entered a User ID that hasn't been registered. | Register the user first (option 1), or check for a typo. |
| "A user with ID ... is already registered." | Duplicate User ID. | Choose a different, unused User ID. |
| "Category must be one of: ..." | An unsupported category was typed. | Re-enter using one of the four exact category names shown. |
| "Only a Service Officer may ..." / "Only the assigned Technician may ..." | The wrong role attempted a workflow action. | Perform the action using a User ID registered with the correct role. |
| "Request cannot be ... while status is ..." | The request is not at the right stage of the workflow yet. | Complete the workflow steps in order (see above). |
| "Failed to read/write ..." | A problem accessing the `data/` folder (e.g. permissions). | Confirm the `data/` folder is writable and try again. |
