'use strict';

const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

const User = require('./User.js');
const ServiceRequest = require('./ServiceRequest.js');
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
  console.log('10. Exit');
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
    const user = new User(userId, firstName, lastName, email, userType);
    manager.registerUser(user);
    console.log(`User "${user.getFullName()}" registered successfully.`);
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

  try {
    const request = new ServiceRequest(
      nextRequestId(),
      requester,
      title,
      description,
      campusLocation,
      category,
      priority
    );
    manager.submitRequest(request);
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
    manager.updateRequest(requestId, userId, changes);
    console.log('Request updated successfully.');
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function cancelMyRequest() {
  const userId = await rl.question('Your User ID: ');
  const requestId = await rl.question('Request ID to cancel: ');
  try {
    manager.cancelRequest(requestId, userId);
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
        running = false;
        break;
      default:
        console.log('Invalid option. Please select a number from 1 to 10.');
    }
  }
  console.log('Goodbye.');
  rl.close();
}

start();
