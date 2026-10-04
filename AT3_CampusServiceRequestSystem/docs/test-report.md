# Test Report

## Part A - Automated Tests (`tests/app.test.js`, run via `npm test`)

All 13 automated tests use temporary data directories (never the real
`data/` folder) and all currently **Pass**.

| Test ID | Feature Tested | Test Input | Expected Result | Actual Result | Result |
|---|---|---|---|---|---|
| T01 | Valid object construction | Construct a `StudentRequester` and an `ICTSupportRequest` with valid data | Objects construct successfully with correct field values | As expected | Pass |
| T02 | Invalid constructor values | Construct `StudentRequester`/`ICTSupportRequest` with missing required specialised fields | Constructor throws a descriptive error | As expected | Pass |
| T03 | Duplicate identifiers | Register the same User ID twice; submit the same Request ID twice | Both duplicates are rejected with a clear error | As expected | Pass |
| T04 | Role permissions | A Technician attempts to review a request; a Technician attempts to assign a Technician | Both actions rejected: "Only a Service Officer may ..." | As expected | Pass |
| T05 | Controlled status transitions | Assign a Technician before review; review the same request twice | Both rejected with a status-based error | As expected | Pass |
| T06 | Specialised request behaviour | Calculate priority score / target hours for an `ICTSupportRequest` with campus-wide impact and a `MaintenanceRequest` with High hazard | Scores/hours reflect the specialised override logic, not just the base priority | As expected | Pass |
| T07 | Polymorphic method calls | Call `getRequestSummary()` on a mixed array of all four request subclasses | Each summary reflects that subclass's own specialised detail | As expected | Pass |
| T08 | Saving JSON data | Register a user and submit a request | `users.json` and `serviceRequests.json` contain the new, valid records | As expected | Pass |
| T09 | Loading and restoring saved objects | Save a reviewed `ICTSupportRequest`, then load it in a brand-new manager instance | Restored object is an `ICTSupportRequest`, keeps its status/priority/history, and remains fully functional (can continue the workflow) | As expected | Pass |
| T10 | Missing or empty data files | Call `loadData()` against an empty temporary directory | Manager starts cleanly with empty users/requests/audit log | As expected | Pass |
| T11 | Report calculations | Submit two requests in different categories/locations | `reportRequestsByStatus`, `reportRequestsByCategory`, `reportVolumeByLocation` return correct counts | As expected | Pass |
| T12 | File-reading/file-writing errors | Attempt to write through a path where a required directory segment is actually a file | Repository throws a clear "Failed to write ..." error | As expected | Pass |
| T13 | Abstract-style base class | Call `calculatePriorityScore()`/`getTargetResolutionHours()`/`getRequestSummary()` directly on a plain `ServiceRequest` | Each call throws a "not implemented" error | As expected | Pass |

Evidence: run `npm test` from the project root - output ends with
`# pass 13` / `# fail 0`.

## Part B - Manual Verification (console application, interactive sessions)

These were run directly against the console application (not the
automated suite) at key milestones during development.

### Required Pass Tests (from the assessment brief)

| Test | Expected Result | Actual Result | Result |
|---|---|---|---|
| Valid user registration | User is added successfully | User added successfully | Pass |
| Duplicate user ID | Second user is rejected | Rejected with clear error | Pass |
| Valid request submission | Request is stored with Submitted status | Stored with Submitted status | Pass |
| Invalid request category | Request is rejected clearly | Rejected with clear error | Pass |
| View requester records | Only the selected user's requests are shown | Only that user's requests shown | Pass |
| Cancel Submitted request | Status changes to Cancelled | Status changed to Cancelled | Pass |

### Required Credit Tests (from the assessment brief)

| Test | Expected Result | Actual Result | Result |
|---|---|---|---|
| Subclass constructors correctly call `super()` | Subclass fields plus inherited fields both populated | Confirmed via `instanceof` and inherited getters | Pass |
| Specialised fields are validated | Missing/invalid specialised field rejected | Rejected with clear error | Pass |
| Only Service Officers can assign Technicians | Technician attempting to assign is rejected | Rejected with clear error | Pass |
| Only assigned Technicians can update work progress | A different Technician is rejected | Rejected with clear error | Pass |
| Invalid status transitions are rejected | Out-of-order transition rejected | Rejected with clear error | Pass |
| Specialised summaries display the correct information | `getRequestSummary()` includes category-specific detail | Confirmed for all three specialised types | Pass |
| Search, filter and sort return correct results | Filtering by category/status/priority/technician; sorting by date/priority | Confirmed correct subsets and order | Pass |
| Request history records approved workflow actions | Every workflow action appears in the request's history array | Confirmed 6 entries across a full review→close lifecycle | Pass |

### End-to-End Persistence Verification (Distinction)

A full application session was run to submit and progress a request
through Review → Assign, then the process was **restarted** and a
second session confirmed the request was correctly restored (including
its specialised subclass, current status and history) and could be
carried through Begin Work → Record Progress → Resolve → Close, with
management reports and the audit log reflecting the final state
correctly.
