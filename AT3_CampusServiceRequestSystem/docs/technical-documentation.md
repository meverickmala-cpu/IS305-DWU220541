# Technical Documentation

## 1. Project Folder Structure

```
AT3_CampusServiceRequestSystem/
├── src/
│   ├── User.js                        # Base User class
│   ├── StudentRequester.js            # User subclass
│   ├── StaffRequester.js              # User subclass
│   ├── ServiceOfficer.js              # User subclass
│   ├── Technician.js                  # User subclass
│   ├── UserFactory.js                 # Restores correct User subclass from JSON
│   ├── ServiceRequest.js              # Abstract-style base request class
│   ├── ICTSupportRequest.js           # ServiceRequest subclass
│   ├── MaintenanceRequest.js          # ServiceRequest subclass
│   ├── CleaningRequest.js             # ServiceRequest subclass
│   ├── GeneralServiceRequest.js       # ServiceRequest subclass (General Campus Service)
│   ├── ServiceRequestFactory.js       # Restores correct request subclass from JSON
│   ├── ServiceRequestManager.js       # Core manager: arrays, workflow, reports, audit
│   ├── CampusServiceApp.js            # Console entry point / menu
│   └── repositories/
│       ├── UserFileRepository.js
│       ├── ServiceRequestFileRepository.js
│       └── AuditFileRepository.js
├── data/                               # JSON data files (simulated data only)
├── docs/                                # Requirements, diagrams, this documentation
├── tests/                               # Automated tests (Node.js test runner)
├── package.json / package-lock.json
└── README.md
```

## 2. Responsibility of Each Class

- **User** - common identity fields (userId, firstName, lastName, email, userType), validation, and JSON serialisation shared by every role.
- **StudentRequester / StaffRequester / ServiceOfficer / Technician** - role-specific fields (programme/year level, department, service section, technical speciality) and role-specific validation, all built on top of `User` via `super()`.
- **UserFactory** - rebuilds the correct `User` subclass from a plain JSON record (using its `userType` field).
- **ServiceRequest** - common request fields (title, description, location, category, priority, status, history), the full controlled status workflow, role-permission checks, and JSON serialisation. Treated as an abstract-style base: `calculatePriorityScore()`, `getTargetResolutionHours()` and `getRequestSummary()` throw unless a subclass overrides them.
- **ICTSupportRequest / MaintenanceRequest / CleaningRequest / GeneralServiceRequest** - category-specific fields and overridden priority/resolution/summary logic reflecting each category's own risk factors (network impact, hazard level, hygiene risk).
- **ServiceRequestFactory** - rebuilds the correct `ServiceRequest` subclass from a plain JSON record (using its `requestType` field) and restores status, dates, technician assignment and history.
- **ServiceRequestManager** - owns the in-memory `users`/`requests` arrays and the audit log; exposes every use case (register, submit, review, assign, work, resolve, close, filter, sort, search, reports) and coordinates persistence through the repositories after each successful mutation.
- **UserFileRepository / ServiceRequestFileRepository / AuditFileRepository** - the only classes that read or write the JSON data files. `CampusServiceApp` and `ServiceRequestManager`'s domain logic never touch `fs` directly except through these.
- **CampusServiceApp** - the console menu; only ever calls `ServiceRequestManager` methods and displays their results/errors.

## 3. Class Relationships

- **Inheritance**: `User` is the superclass of `StudentRequester`, `StaffRequester`, `ServiceOfficer` and `Technician`. `ServiceRequest` is the superclass of `ICTSupportRequest`, `MaintenanceRequest`, `CleaningRequest` and `GeneralServiceRequest`. Every subclass calls its parent constructor with `super()`.
- **Association**: each `ServiceRequest` holds a reference to its requester (`User`, multiplicity 1) and, once assigned, to a `Technician` (0..1). `ServiceRequestManager` manages many `User` and many `ServiceRequest` objects (multiplicity `*` in both directions).
- **Dependency**: `ServiceRequestFactory` and `UserFactory` depend on the request/user subclasses to construct them from saved data, but are not themselves part of either hierarchy. `ServiceRequestManager` depends on the three repository classes for persistence, and on both factories when reloading saved data.
- See `docs/diagrams/complete-class-diagram.svg` for the full visual relationships.

## 4. Where Encapsulation Is Used

Every class uses JavaScript private fields (`#fieldName`) for all of its data - `userId`, `status`, `history`, etc. are never exposed directly; all access goes through public getters, or through controlled setters/methods (`updateDetails()`, `cancelRequest()`, workflow methods) that validate before changing state.

## 5. Where Inheritance and Constructor Chaining Are Used

`StudentRequester`, `StaffRequester`, `ServiceOfficer` and `Technician` all extend `User` and call `super(userId, firstName, lastName, email, userType)` before initialising their own specialised fields. `ICTSupportRequest`, `MaintenanceRequest`, `CleaningRequest` and `GeneralServiceRequest` all extend `ServiceRequest` and call `super(commonRequestData)` before validating and initialising their specialised fields, exactly matching the `constructor(commonRequestData, specialisedData) { super(commonRequestData); ... }` pattern in the brief.

## 6. Where Overriding and Polymorphism Are Used

Each `ServiceRequest` subclass overrides `calculatePriorityScore()`, `getTargetResolutionHours()` and `getRequestSummary()` (three overrides - the brief requires at least two). `ServiceRequestManager.sortByPriority()` and the reporting/menu code call these same three method names on a mixed array of subclass instances without knowing which concrete class each one is - each object's own overridden version runs (polymorphism). The base `ServiceRequest` versions of these three methods throw a clear error, enforcing that every concrete request type supplies its own behaviour (abstract-style base class).

## 7. How the Request Workflow Is Controlled

`ServiceRequest` enforces the status sequence `Submitted -> Reviewed -> Assigned -> In Progress -> Resolved -> Closed` (with `Cancelled` as a final state reachable only from `Submitted`). Each workflow method (`reviewRequest`, `assignTechnician`, `beginWork`, `recordProgress`, `resolveRequest`, `closeRequest`) checks both the actor's role (via `instanceof`) and the request's current status before making any change, and throws a clear error otherwise. Every transition is also recorded in the request's `history` array (previous status, new status, action, actor, comment, timestamp).

## 8. How Validation and Errors Are Handled

Every class exposes a `validate()` method (or validates directly in its constructor for specialised fields) returning `{ valid, errors }` or throwing a descriptive `Error`. `ServiceRequestManager` and `CampusServiceApp` catch these errors and display a clear message to the user rather than crashing; repository methods wrap file-system errors in a clear `Error` (e.g. `Failed to write <path>: <reason>`) rather than letting a raw exception escape.

## 9. How JSON Data Is Stored and Restored

`ServiceRequestManager.loadData()` reads `users.json`, `serviceRequests.json`, `requestHistory.json` and `auditLog.json` through the repository classes (an empty array is used for any file that does not exist yet). Plain JSON records are passed to `UserFactory.createFromData()` / `ServiceRequestFactory.createFromData()`, which reconstruct the correct subclass, resolve the requester/technician references by ID, and call `restoreState()` / `restoreHistory()` to reapply the persisted status, dates and history without going through the normal "always starts at Submitted" constructor path. After every successful mutation, the manager serialises the current in-memory arrays back to disk via the repositories.

## 10. How Tests Are Organised

All automated tests live in `tests/app.test.js` and use Node's built-in test runner (`node --test`, or `npm test`). Every test that touches the file system constructs its own `ServiceRequestManager` pointed at a fresh temporary directory (`fs.mkdtemp`), so the real `data/` folder used by the application is never read or overwritten by the test suite, and each temporary directory is removed afterwards.

## 11. Known Limitations

- Single-session console application - no concurrent multi-user access.
- No password-based authentication; a user is identified by User ID only.
- Priority scoring and target resolution hours use simple, illustrative rules rather than a configurable policy engine.

## 12. Future Improvements

- A configuration file for priority scoring rules and target resolution hours per category.
- Pagination for `View All Requests` once the dataset grows large.
- A notifications feature (e.g. alerting a Technician when a new request is assigned).
