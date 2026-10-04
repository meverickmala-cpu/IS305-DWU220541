'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');

const User = require('../src/User.js');
const StudentRequester = require('../src/StudentRequester.js');
const ServiceOfficer = require('../src/ServiceOfficer.js');
const Technician = require('../src/Technician.js');
const ServiceRequest = require('../src/ServiceRequest.js');
const ICTSupportRequest = require('../src/ICTSupportRequest.js');
const MaintenanceRequest = require('../src/MaintenanceRequest.js');
const CleaningRequest = require('../src/CleaningRequest.js');
const GeneralServiceRequest = require('../src/GeneralServiceRequest.js');
const ServiceRequestManager = require('../src/ServiceRequestManager.js');
const UserFileRepository = require('../src/repositories/UserFileRepository.js');
const ServiceRequestFileRepository = require('../src/repositories/ServiceRequestFileRepository.js');
const AuditFileRepository = require('../src/repositories/AuditFileRepository.js');

/**
 * All tests use a fresh temporary directory for JSON data files, so the
 * application's real data/ folder is never touched or overwritten.
 */
async function makeTempManager() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'at3-test-'));
  const manager = new ServiceRequestManager(
    new UserFileRepository(path.join(dir, 'users.json')),
    new ServiceRequestFileRepository(
      path.join(dir, 'serviceRequests.json'),
      path.join(dir, 'requestHistory.json')
    ),
    new AuditFileRepository(path.join(dir, 'auditLog.json'))
  );
  return { manager, dir };
}

async function cleanupDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

function sampleStudent(id = 'DWU001') {
  return new StudentRequester(id, 'Jane', 'Lee', 'jane.lee@example.com', 'BIS', '2');
}

function sampleOfficer(id = 'OFF001') {
  return new ServiceOfficer(id, 'Grace', 'Tau', 'grace.tau@example.com', 'Facilities');
}

function sampleTechnician(id = 'TECH001') {
  return new Technician(id, 'Sam', 'Kaupa', 'sam.kaupa@example.com', 'Networking');
}

function sampleIctRequest(requester, requestId = 'REQ001') {
  return new ICTSupportRequest(
    {
      requestId,
      requester,
      title: 'Wi-Fi down',
      description: 'Cannot connect',
      campusLocation: 'Library',
      priority: 'Medium',
    },
    { deviceType: 'Laptop', systemName: 'Campus Wi-Fi', faultType: 'Connectivity', networkImpact: 'Campus-wide' }
  );
}

// 1. Valid object construction
test('valid object construction: User and ServiceRequest subclasses construct successfully', () => {
  const student = sampleStudent();
  assert.equal(student.getUserType(), 'StudentRequester');
  assert.equal(student.getProgramme(), 'BIS');

  const request = sampleIctRequest(student);
  assert.equal(request.getStatus(), 'Submitted');
  assert.equal(request.getCategory(), 'ICT Support');
});

// 2. Invalid constructor values
test('invalid constructor values: specialised classes reject missing required fields', () => {
  assert.throws(() => new StudentRequester('X', 'A', 'B', 'a@b.com', '', ''), /Programme is required/);
  assert.throws(
    () =>
      new ICTSupportRequest(
        { requestId: 'R1', requester: sampleStudent(), title: 't', description: 'd', campusLocation: 'l', priority: 'Low' },
        { deviceType: '', systemName: 'x', faultType: 'x', networkImpact: 'x' }
      ),
    /Device type is required/
  );
});

// 3. Duplicate identifiers
test('duplicate identifiers: manager rejects duplicate user and request IDs', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    await manager.registerUser(student);
    await assert.rejects(() => manager.registerUser(sampleStudent()), /already registered/);

    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));
    await assert.rejects(
      () => manager.submitRequest(sampleIctRequest(student, 'REQ001')),
      /already exists/
    );
  } finally {
    await cleanupDir(dir);
  }
});

// 4. Role permissions
test('role permissions: only the correct role may perform each workflow action', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    const officer = sampleOfficer();
    const tech = sampleTechnician();
    await manager.registerUser(student);
    await manager.registerUser(officer);
    await manager.registerUser(tech);
    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));

    await assert.rejects(
      () => manager.reviewRequest('REQ001', 'TECH001', 'High'),
      /Only a Service Officer/
    );
    await manager.reviewRequest('REQ001', 'OFF001', 'High');
    await assert.rejects(
      () => manager.assignTechnician('REQ001', 'TECH001', 'TECH001'),
      /Only a Service Officer/
    );
  } finally {
    await cleanupDir(dir);
  }
});

// 5. Controlled status transitions
test('controlled status transitions: invalid transitions are rejected', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    const officer = sampleOfficer();
    const tech = sampleTechnician();
    await manager.registerUser(student);
    await manager.registerUser(officer);
    await manager.registerUser(tech);
    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));

    // Cannot assign before review.
    await assert.rejects(
      () => manager.assignTechnician('REQ001', 'OFF001', 'TECH001'),
      /cannot be assigned/
    );

    await manager.reviewRequest('REQ001', 'OFF001', 'High');
    // Cannot review twice.
    await assert.rejects(
      () => manager.reviewRequest('REQ001', 'OFF001', 'Low'),
      /cannot be reviewed/
    );
  } finally {
    await cleanupDir(dir);
  }
});

// 6. Specialised request behaviour
test('specialised request behaviour: overridden priority scoring reflects specialised fields', () => {
  const student = sampleStudent();
  const ict = sampleIctRequest(student);
  // Medium base score (2) + widespread network impact bonus (+1) = 3
  assert.equal(ict.calculatePriorityScore(), 3);

  const maint = new MaintenanceRequest(
    { requestId: 'REQ002', requester: student, title: 't', description: 'd', campusLocation: 'l', priority: 'Low' },
    { building: 'A', roomNumber: '1', hazardLevel: 'High', equipmentAffected: 'Chair' }
  );
  // High hazard forces maximum priority score regardless of stated priority.
  assert.equal(maint.calculatePriorityScore(), 4);
  assert.equal(maint.getTargetResolutionHours(), 2);
});

// 7. Polymorphic method calls
test('polymorphic method calls: same method call produces type-specific results across a mixed collection', () => {
  const student = sampleStudent();
  const requests = [
    sampleIctRequest(student, 'REQ001'),
    new MaintenanceRequest(
      { requestId: 'REQ002', requester: student, title: 't', description: 'd', campusLocation: 'l', priority: 'Low' },
      { building: 'A', roomNumber: '1', hazardLevel: 'Low', equipmentAffected: 'Desk' }
    ),
    new CleaningRequest(
      { requestId: 'REQ003', requester: student, title: 't', description: 'd', campusLocation: 'l', priority: 'Low' },
      { cleaningArea: 'Hall', hygieneRisk: 'High', serviceType: 'Spill', preferredServiceTime: 'Morning' }
    ),
    new GeneralServiceRequest({ requestId: 'REQ004', requester: student, title: 't', description: 'd', campusLocation: 'l', priority: 'Low' }),
  ];
  const summaries = requests.map((r) => r.getRequestSummary());
  assert.equal(summaries.length, 4);
  assert.ok(summaries[0].includes('ICT Support -'));
  assert.ok(summaries[1].includes('Maintenance -'));
  assert.ok(summaries[2].includes('Cleaning -'));
  assert.ok(!summaries[3].includes(' | ')); // GeneralServiceRequest adds no extra suffix
});

// 8. Saving JSON data
test('saving JSON data: registering a user and submitting a request writes valid JSON files', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    await manager.registerUser(student);
    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));

    const usersRaw = await fs.readFile(path.join(dir, 'users.json'), 'utf-8');
    const users = JSON.parse(usersRaw);
    assert.equal(users.length, 1);
    assert.equal(users[0].userId, 'DWU001');

    const requestsRaw = await fs.readFile(path.join(dir, 'serviceRequests.json'), 'utf-8');
    const requests = JSON.parse(requestsRaw);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].requestType, 'ICTSupportRequest');
  } finally {
    await cleanupDir(dir);
  }
});

// 9. Loading and restoring saved objects
test('loading and restoring saved objects: a fresh manager instance restores full working objects', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    const officer = sampleOfficer();
    await manager.registerUser(student);
    await manager.registerUser(officer);
    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));
    await manager.reviewRequest('REQ001', 'OFF001', 'High');

    const reloaded = new ServiceRequestManager(
      new UserFileRepository(path.join(dir, 'users.json')),
      new ServiceRequestFileRepository(
        path.join(dir, 'serviceRequests.json'),
        path.join(dir, 'requestHistory.json')
      ),
      new AuditFileRepository(path.join(dir, 'auditLog.json'))
    );
    await reloaded.loadData();

    const restored = reloaded.findRequestById('REQ001');
    assert.ok(restored instanceof ICTSupportRequest);
    assert.equal(restored.getStatus(), 'Reviewed');
    assert.equal(restored.getPriority(), 'High');
    assert.equal(restored.getHistory().length, 1);
    // Restored object must remain fully functional (not just inert data) -
    // continuing the workflow requires a registered Technician too.
    const reloadedTech = sampleTechnician();
    await reloaded.registerUser(reloadedTech);
    await reloaded.assignTechnician('REQ001', 'OFF001', reloadedTech.getUserId());
    assert.equal(reloaded.findRequestById('REQ001').getStatus(), 'Assigned');
  } finally {
    await cleanupDir(dir);
  }
});

// 10. Missing or empty data files
test('missing or empty data files: loadData() starts cleanly with no existing files', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    assert.equal(manager.getAllRequests().length, 0);
    assert.equal(manager.findUserById('anyone'), null);
    assert.equal(manager.getAuditLog().length, 0);
  } finally {
    await cleanupDir(dir);
  }
});

// 11. Report calculations
test('report calculations: reports correctly aggregate submitted requests', async () => {
  const { manager, dir } = await makeTempManager();
  try {
    await manager.loadData();
    const student = sampleStudent();
    await manager.registerUser(student);
    await manager.submitRequest(sampleIctRequest(student, 'REQ001'));
    await manager.submitRequest(
      new MaintenanceRequest(
        { requestId: 'REQ002', requester: student, title: 't', description: 'd', campusLocation: 'Library', priority: 'Low' },
        { building: 'A', roomNumber: '1', hazardLevel: 'Low', equipmentAffected: 'Desk' }
      )
    );

    const byStatus = manager.reportRequestsByStatus();
    assert.equal(byStatus.Submitted, 2);

    const byCategory = manager.reportRequestsByCategory();
    assert.equal(byCategory['ICT Support'], 1);
    assert.equal(byCategory['Facilities Maintenance'], 1);

    const byLocation = manager.reportVolumeByLocation();
    assert.equal(byLocation.Library, 2);
  } finally {
    await cleanupDir(dir);
  }
});

// 12. File-reading / file-writing errors
test('file-reading and file-writing errors: repository throws a clear error on write failure', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'at3-test-'));
  try {
    // Create a plain FILE where the repository will try to create a
    // DIRECTORY - mkdir(..., { recursive: true }) then fails with ENOTDIR
    // regardless of user privilege level, giving a reliable write failure.
    const blockerPath = path.join(dir, 'blocker');
    await fs.writeFile(blockerPath, 'not a directory');
    const repo = new UserFileRepository(path.join(blockerPath, 'users.json'));
    await assert.rejects(() => repo.saveAll([{ userId: 'X' }]), /Failed to write/);
  } finally {
    await cleanupDir(dir);
  }
});

test('abstract-style base class: ServiceRequest throws when its methods are not overridden', () => {
  const student = sampleStudent();
  const raw = new ServiceRequest({
    requestId: 'REQ999',
    requester: student,
    title: 't',
    description: 'd',
    campusLocation: 'l',
    category: 'General Campus Service',
    priority: 'Low',
  });
  assert.throws(() => raw.calculatePriorityScore(), /not implemented/);
  assert.throws(() => raw.getTargetResolutionHours(), /not implemented/);
  assert.throws(() => raw.getRequestSummary(), /not implemented/);
});
