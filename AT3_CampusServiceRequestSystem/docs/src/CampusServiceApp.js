'use strict';

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

const User = require('./User.js');
const StudentRequester = require('./StudentRequester.js');
const StaffRequester = require('./StaffRequester.js');
const ServiceOfficer = require('./ServiceOfficer.js');
const Technician = require('./Technician.js');
const ServiceRequest = require('./ServiceRequest.js');
const ICTSupportRequest = require('./ICTSupportRequest.js');
const MaintenanceRequest = require('./MaintenanceRequest.js');
const CleaningRequest = require('./CleaningRequest.js');
const GeneralServiceRequest = require('./GeneralServiceRequest.js');
const ServiceRequestManager = require('./ServiceRequestManager.js');

const rl = readline.createInterface({ input, output });
const manager = new ServiceRequestManager();

let requestCounter = 0;

function nextRequestId() {
  requestCounter += 1;
  return `REQ${String(requestCounter).padStart(3, '0')}`;
}

function printMenu() {
  console.log('\n=====================================');
  console.log('     CAMPUS SERVICE REQUEST SYSTEM');
  console.log('=====================================');
  console.log('1. Register User');
  console.log('2. Submit Service Request');
  console.log('3. View Request by ID');
  console.log('4. View My Requests');
  console.log('5. View All Requests');
  console.log('6. Update My Request');
  console.log('7. Cancel My Request');
  console.log('8. Search Requests');
  console.log('9. View Request Summary');
  console.log('10. Review Request (Service Officer)');
  console.log('11. Assign Technician (Service Officer)');
  console.log('12. Begin Work (Technician)');
  console.log('13. Record Progress (Technician)');
  console.log('14. Resolve Request (Technician)');
  console.log('15. Close Request (Service Officer)');
  console.log('16. Filter Requests');
  console.log('17. Sort Requests');
  console.log('18. View Request History');
  console.log('19. View Management Reports');
  console.log('20. View Audit Log');
  console.log('21. Exit');
  console.log('=====================================');
}

async function registerUser() {
  const userId = await rl.question('User ID: ');
  const firstName = await rl.question('First name: ');
  const lastName = await rl.question('Last name: ');
  const email = await rl.question('Email address: ');
  console.log(`Valid user types: ${User.VALID_USER_TYPES.join(', ')}`);
  const userType = await rl.question('User type: ');

  try {
    let user;
    switch (userType) {
      case 'StudentRequester': {
        const programme = await rl.question('Programme: ');
        const yearLevel = await rl.question('Year level: ');
        user = new StudentRequester(userId, firstName, lastName, email, programme, yearLevel);
        break;
      }
      case 'StaffRequester': {
        const department = await rl.question('Department: ');
        user = new StaffRequester(userId, firstName, lastName, email, department);
        break;
      }
      case 'ServiceOfficer': {
        const serviceSection = await rl.question('Service section: ');
        user = new ServiceOfficer(userId, firstName, lastName, email, serviceSection);
        break;
      }
      case 'Technician': {
        const technicalSpeciality = await rl.question('Technical speciality: ');
        user = new Technician(userId, firstName, lastName, email, technicalSpeciality);
        break;
      }
      default:
        // Administrator (or any other listed type without a dedicated subclass).
        user = new User(userId, firstName, lastName, email, userType);
    }
    await manager.registerUser(user);
    console.log(`User "${user.getFullName()}" registered successfully as ${user.getUserType()}.`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function submitRequest() {
  const userId = await rl.question('Your User ID: ');
  const requester = manager.findUserById(userId);
  if (!requester) {
    console.log('Error: No user found with that ID. Please register first.');
    return;
  }

  const title = await rl.question('Request title: ');
  const description = await rl.question('Description: ');
  const campusLocation = await rl.question('Campus location: ');
  console.log(`Categories: ${ServiceRequest.REQUIRED_CATEGORIES.join(', ')}`);
  const category = await rl.question('Category: ');
  console.log(`Priorities: ${ServiceRequest.VALID_PRIORITIES.join(', ')}`);
  const priority = await rl.question('Priority: ');

  const commonRequestData = {
    requestId: nextRequestId(),
    requester,
    title,
    description,
    campusLocation,
    category,
    priority,
  };

  try {
    let request;
    switch (category) {
      case 'ICT Support': {
        const deviceType = await rl.question('Device type: ');
        const systemName = await rl.question('System name: ');
        const faultType = await rl.question('Fault type: ');
        const networkImpact = await rl.question('Network impact: ');
        request = new ICTSupportRequest(commonRequestData, {
          deviceType,
          systemName,
          faultType,
          networkImpact,
        });
        break;
      }
      case 'Facilities Maintenance': {
        const building = await rl.question('Building: ');
        const roomNumber = await rl.question('Room number: ');
        const hazardLevel = await rl.question('Hazard level (Low/Medium/High): ');
        const equipmentAffected = await rl.question('Equipment affected: ');
        request = new MaintenanceRequest(commonRequestData, {
          building,
          roomNumber,
          hazardLevel,
          equipmentAffected,
        });
        break;
      }
      case 'Cleaning and Sanitation': {
        const cleaningArea = await rl.question('Cleaning area: ');
        const hygieneRisk = await rl.question('Hygiene risk (Low/Medium/High): ');
        const serviceType = await rl.question('Service type: ');
        const preferredServiceTime = await rl.question('Preferred service time: ');
        request = new CleaningRequest(commonRequestData, {
          cleaningArea,
          hygieneRisk,
          serviceType,
          preferredServiceTime,
        });
        break;
      }
      default:
        // General Campus Service (or any other listed category without a
        // dedicated subclass).
        request = new GeneralServiceRequest(commonRequestData);
    }
    await manager.submitRequest(request);
    console.log(`Request submitted successfully with ID: ${request.getRequestId()}`);
  } catch (err) {
    requestCounter -= 1; // release unused ID on failed submission
    console.log(`Error: ${err.message}`);
  }
}

async function viewRequestById() {
  const requestId = await rl.question('Request ID: ');
  const request = manager.findRequestById(requestId);
  console.log(request ? request.getRequestSummary() : 'No request found with that ID.');
}

async function viewMyRequests() {
  const userId = await rl.question('Your User ID: ');
  const requests = manager.getRequestsByUser(userId);
  if (requests.length === 0) {
    console.log('No requests found for this user.');
    return;
  }
  requests.forEach((r) => console.log(r.getRequestSummary()));
}

function viewAllRequests() {
  const requests = manager.getAllRequests();
  if (requests.length === 0) {
    console.log('No requests have been submitted yet.');
    return;
  }
  requests.forEach((r) => console.log(r.getRequestSummary()));
}

async function updateMyRequest() {
  const userId = await rl.question('Your User ID: ');
  const requestId = await rl.question('Request ID to update: ');
  console.log('Leave a field blank to keep its current value.');
  const title = await rl.question('New title: ');
  const description = await rl.question('New description: ');
  const campusLocation = await rl.question('New campus location: ');
  const category = await rl.question('New category (blank to keep current): ');
  const priority = await rl.question('New priority (blank to keep current): ');

  const changes = {};
  if (title) changes.title = title;
  if (description) changes.description = description;
  if (campusLocation) changes.campusLocation = campusLocation;
  if (category) changes.category = category;
  if (priority) changes.priority = priority;

  try {
    await manager.updateRequest(requestId, userId, changes);
    console.log('Request updated successfully.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function cancelMyRequest() {
  const userId = await rl.question('Your User ID: ');
  const requestId = await rl.question('Request ID to cancel: ');
  try {
    await manager.cancelRequest(requestId, userId);
    console.log('Request cancelled successfully.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function searchRequests() {
  const searchText = await rl.question('Search by request ID or title: ');
  const results = manager.searchRequests(searchText);
  if (results.length === 0) {
    console.log('No matching requests found.');
    return;
  }
  results.forEach((r) => console.log(r.getRequestSummary()));
}

function viewRequestSummary() {
  const summary = manager.getRequestSummaryByStatus();
  const statuses = Object.keys(summary);
  if (statuses.length === 0) {
    console.log('No requests have been submitted yet.');
    return;
  }
  for (const status of statuses) {
    console.log(`\n${status} (${summary[status].length}):`);
    summary[status].forEach((line) => console.log(`  ${line}`));
  }
}

async function reviewRequest() {
  const officerId = await rl.question('Your User ID (Service Officer): ');
  const requestId = await rl.question('Request ID to review: ');
  console.log(`Priorities: ${ServiceRequest.VALID_PRIORITIES.join(', ')}`);
  const priority = await rl.question('Set priority: ');
  try {
    await manager.reviewRequest(requestId, officerId, priority);
    console.log('Request reviewed successfully.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function assignTechnician() {
  const officerId = await rl.question('Your User ID (Service Officer): ');
  const requestId = await rl.question('Request ID to assign: ');
  const technicianId = await rl.question('Technician User ID: ');
  try {
    await manager.assignTechnician(requestId, officerId, technicianId);
    console.log('Technician assigned successfully.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function beginWork() {
  const technicianId = await rl.question('Your User ID (Technician): ');
  const requestId = await rl.question('Request ID: ');
  try {
    await manager.beginWork(requestId, technicianId);
    console.log('Work started on request.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function recordProgress() {
  const technicianId = await rl.question('Your User ID (Technician): ');
  const requestId = await rl.question('Request ID: ');
  const note = await rl.question('Progress note: ');
  try {
    await manager.recordProgress(requestId, technicianId, note);
    console.log('Progress recorded.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function resolveRequest() {
  const technicianId = await rl.question('Your User ID (Technician): ');
  const requestId = await rl.question('Request ID: ');
  const notes = await rl.question('Resolution notes: ');
  try {
    await manager.resolveRequest(requestId, technicianId, notes);
    console.log('Request resolved.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function closeRequest() {
  const officerId = await rl.question('Your User ID (Service Officer): ');
  const requestId = await rl.question('Request ID to close: ');
  try {
    await manager.closeRequest(requestId, officerId);
    console.log('Request closed.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

function printResults(requests) {
  if (requests.length === 0) {
    console.log('No matching requests found.');
    return;
  }
  requests.forEach((r) => console.log(r.getRequestSummary()));
}

async function filterRequests() {
  console.log('Filter by: 1) Category  2) Status  3) Priority  4) Technician');
  const choice = await rl.question('Select an option: ');
  switch (choice.trim()) {
    case '1': {
      console.log(`Categories: ${ServiceRequest.REQUIRED_CATEGORIES.join(', ')}`);
      const category = await rl.question('Category: ');
      printResults(manager.filterByCategory(category));
      break;
    }
    case '2': {
      console.log(`Statuses: ${ServiceRequest.FULL_STATUSES.join(', ')}`);
      const status = await rl.question('Status: ');
      printResults(manager.filterByStatus(status));
      break;
    }
    case '3': {
      console.log(`Priorities: ${ServiceRequest.VALID_PRIORITIES.join(', ')}`);
      const priority = await rl.question('Priority: ');
      printResults(manager.filterByPriority(priority));
      break;
    }
    case '4': {
      const technicianId = await rl.question('Technician User ID: ');
      printResults(manager.filterByTechnician(technicianId));
      break;
    }
    default:
      console.log('Invalid filter option.');
  }
}

async function sortRequests() {
  console.log('Sort by: 1) Date Submitted  2) Priority');
  const choice = await rl.question('Select an option: ');
  if (choice.trim() === '1') {
    printResults(manager.sortByDateSubmitted());
  } else if (choice.trim() === '2') {
    printResults(manager.sortByPriority());
  } else {
    console.log('Invalid sort option.');
  }
}

async function viewRequestHistory() {
  const requestId = await rl.question('Request ID: ');
  const request = manager.findRequestById(requestId);
  if (!request) {
    console.log('No request found with that ID.');
    return;
  }
  const history = request.getHistory();
  if (history.length === 0) {
    console.log('No history recorded for this request yet.');
    return;
  }
  history.forEach((h) => {
    console.log(
      `${h.dateTime.toISOString()} | ${h.actionPerformed} | ${h.previousStatus} -> ${h.newStatus} ` +
        `| by ${h.actorId} (${h.actorRole})${h.comment ? ' | ' + h.comment : ''}`
    );
  });
}

function viewManagementReports() {
  const byStatus = manager.reportRequestsByStatus();
  const byCategory = manager.reportRequestsByCategory();
  const byLocation = manager.reportVolumeByLocation();
  const avgResolutionHours = manager.reportAverageResolutionHours();

  console.log('\n--- Requests by Status ---');
  Object.entries(byStatus).forEach(([status, count]) => console.log(`${status}: ${count}`));

  console.log('\n--- Requests by Category ---');
  Object.entries(byCategory).forEach(([category, count]) => console.log(`${category}: ${count}`));

  console.log('\n--- Request Volume by Campus Location ---');
  Object.entries(byLocation).forEach(([location, count]) => console.log(`${location}: ${count}`));

  console.log('\n--- Average Resolution Time ---');
  console.log(`${avgResolutionHours} hours (across Resolved/Closed requests)`);
}

function viewAuditLog() {
  const auditLog = manager.getAuditLog();
  if (auditLog.length === 0) {
    console.log('No audit records yet.');
    return;
  }
  auditLog.forEach((a) => {
    const dateTime = a.dateTime instanceof Date ? a.dateTime.toISOString() : a.dateTime;
    console.log(
      `${a.auditId} | ${dateTime} | ${a.actionPerformed} | by ${a.actorId} (${a.actorRole}) ` +
        `| Request: ${a.affectedRequestId || '-'} | ${a.description} | Result: ${a.result}`
    );
  });
}

async function start() {
  let running = true;
  while (running) {
    printMenu();
    const choice = await rl.question('Select an option: ');

    switch (choice.trim()) {
      case '1':
        await registerUser();
        break;
      case '2':
        await submitRequest();
        break;
      case '3':
        await viewRequestById();
        break;
      case '4':
        await viewMyRequests();
        break;
      case '5':
        viewAllRequests();
        break;
      case '6':
        await updateMyRequest();
        break;
      case '7':
        await cancelMyRequest();
        break;
      case '8':
        await searchRequests();
        break;
      case '9':
        viewRequestSummary();
        break;
      case '10':
        await reviewRequest();
        break;
      case '11':
        await assignTechnician();
        break;
      case '12':
        await beginWork();
        break;
      case '13':
        await recordProgress();
        break;
      case '14':
        await resolveRequest();
        break;
      case '15':
        await closeRequest();
        break;
      case '16':
        await filterRequests();
        break;
      case '17':
        await sortRequests();
        break;
      case '18':
        await viewRequestHistory();
        break;
      case '19':
        viewManagementReports();
        break;
      case '20':
        viewAuditLog();
        break;
      case '21':
        running = false;
        break;
      default:
        console.log('Invalid option. Please select a number from 1 to 21.');
    }
  }
  console.log('Goodbye.');
  rl.close();
}

manager
  .loadData()
  .then(start)
  .catch((err) => {
    console.error(`Failed to load saved data: ${err.message}`);
    process.exit(1);
  });
