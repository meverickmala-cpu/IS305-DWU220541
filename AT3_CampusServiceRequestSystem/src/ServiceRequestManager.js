'use strict';

const UserFileRepository = require('./repositories/UserFileRepository.js');
const ServiceRequestFileRepository = require('./repositories/ServiceRequestFileRepository.js');
const AuditFileRepository = require('./repositories/AuditFileRepository.js');
const UserFactory = require('./UserFactory.js');
const ServiceRequestFactory = require('./ServiceRequestFactory.js');

/**
 * ServiceRequestManager Class
 * Manages Users and ServiceRequests using in-memory JavaScript arrays,
 * backed by JSON file persistence (Distinction Extension) via injected
 * file repositories. CampusServiceApp never reads or writes JSON files
 * itself - it only ever calls methods on this manager.
 */

class ServiceRequestManager {
  #users;
  #requests;
  #auditLog;
  #userRepo;
  #requestRepo;
  #auditRepo;
  #auditCounter;

  constructor(
    userRepo = new UserFileRepository(),
    requestRepo = new ServiceRequestFileRepository(),
    auditRepo = new AuditFileRepository()
  ) {
    this.#users = [];
    this.#requests = [];
    this.#auditLog = [];
    this.#userRepo = userRepo;
    this.#requestRepo = requestRepo;
    this.#auditRepo = auditRepo;
    this.#auditCounter = 0;
  }

  /**
   * Loads existing users, requests, request history and audit records
   * from the JSON data files. Must be called once before the application
   * starts serving requests. An empty array is used for any data file
   * that does not exist yet.
   */
  async loadData() {
    const savedUsers = await this.#userRepo.loadAll();
    this.#users = savedUsers.map((u) => UserFactory.createFromData(u));

    const savedRequests = await this.#requestRepo.loadAll();
    const savedHistory = await this.#requestRepo.loadHistory();

    this.#requests = savedRequests.map((r) => {
      const requester = this.findUserById(r.requesterId);
      const technician = r.assignedTechnicianId ? this.findUserById(r.assignedTechnicianId) : null;
      const request = ServiceRequestFactory.createFromData(r, requester, technician);
      const historyForRequest = savedHistory
        .filter((h) => h.requestId === r.requestId)
        .map(({ requestId, ...entry }) => entry);
      request.restoreHistory(historyForRequest);
      return request;
    });

    this.#auditLog = await this.#auditRepo.loadAll();
    this.#auditCounter = this.#auditLog.length;
  }

  // --- Audit trail (Distinction) ---

  #nextAuditId() {
    this.#auditCounter += 1;
    return `AUD${String(this.#auditCounter).padStart(4, '0')}`;
  }

  #addAuditEntry(actor, actionPerformed, affectedRequestId, description, result) {
    this.#auditLog.push({
      auditId: this.#nextAuditId(),
      actorId: actor ? actor.getUserId() : null,
      actorRole: actor ? actor.getUserType() : null,
      actionPerformed,
      affectedRequestId: affectedRequestId || null,
      description: description || '',
      dateTime: new Date(),
      result,
    });
  }

  getAuditLog() {
    return [...this.#auditLog];
  }

  // --- Persistence helpers ---

  async #persistUsers() {
    await this.#userRepo.saveAll(this.#users.map((u) => u.toJSON()));
  }

  async #persistRequests() {
    await this.#requestRepo.saveAll(this.#requests.map((r) => r.toJSON()));
    const allHistory = [];
    for (const r of this.#requests) {
      for (const h of r.getHistory()) {
        allHistory.push({ requestId: r.getRequestId(), ...h });
      }
    }
    await this.#requestRepo.saveHistory(allHistory);
  }

  async #persistAudit() {
    await this.#auditRepo.saveAll(this.#auditLog);
  }

  // --- Pass-level: users ---

  async registerUser(user) {
    const validation = user.validate();
    if (!validation.valid) {
      throw new Error(`Cannot register user: ${validation.errors.join(' ')}`);
    }
    if (this.findUserById(user.getUserId())) {
      throw new Error(`A user with ID "${user.getUserId()}" is already registered.`);
    }
    this.#users.push(user);
    this.#addAuditEntry(user, 'Register User', null, `Registered as ${user.getUserType()}`, 'Success');
    await this.#persistUsers();
    await this.#persistAudit();
    return user;
  }

  findUserById(userId) {
    return this.#users.find((u) => u.getUserId() === userId) || null;
  }

  // --- Pass-level: requests ---

  async submitRequest(request) {
    const validation = request.validate();
    if (!validation.valid) {
      throw new Error(`Cannot submit request: ${validation.errors.join(' ')}`);
    }
    if (this.findRequestById(request.getRequestId())) {
      throw new Error(`A request with ID "${request.getRequestId()}" already exists.`);
    }
    this.#requests.push(request);
    this.#addAuditEntry(
      request.getRequester(),
      'Request Creation',
      request.getRequestId(),
      request.getTitle(),
      'Success'
    );
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  findRequestById(requestId) {
    return this.#requests.find((r) => r.getRequestId() === requestId) || null;
  }

  getRequestsByUser(userId) {
    return this.#requests.filter((r) => r.getRequester().getUserId() === userId);
  }

  getAllRequests() {
    return [...this.#requests];
  }

  async updateRequest(requestId, userId, changes) {
    const request = this.#getRequestOrThrow(requestId);
    request.updateDetails(userId, changes);
    this.#addAuditEntry(
      request.getRequester(),
      'Request Update',
      requestId,
      `Updated fields: ${Object.keys(changes).join(', ')}`,
      'Success'
    );
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async cancelRequest(requestId, userId) {
    const request = this.#getRequestOrThrow(requestId);
    request.cancelRequest(userId);
    this.#addAuditEntry(request.getRequester(), 'Cancellation', requestId, '', 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  // --- Credit workflow: review, assign, work, resolve, close ---

  async reviewRequest(requestId, officerId, priority) {
    const request = this.#getRequestOrThrow(requestId);
    const officer = this.#getUserOrThrow(officerId);
    request.reviewRequest(officer, priority);
    this.#addAuditEntry(officer, 'Priority Change', requestId, `Priority set to ${priority}`, 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async assignTechnician(requestId, officerId, technicianId) {
    const request = this.#getRequestOrThrow(requestId);
    const officer = this.#getUserOrThrow(officerId);
    const technician = this.#getUserOrThrow(technicianId);
    request.assignTechnician(officer, technician);
    this.#addAuditEntry(
      officer,
      'Technician Assignment',
      requestId,
      `Assigned to ${technicianId}`,
      'Success'
    );
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async beginWork(requestId, technicianId) {
    const request = this.#getRequestOrThrow(requestId);
    const technician = this.#getUserOrThrow(technicianId);
    request.beginWork(technician);
    this.#addAuditEntry(technician, 'Status Change', requestId, 'Work started', 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async recordProgress(requestId, technicianId, note) {
    const request = this.#getRequestOrThrow(requestId);
    const technician = this.#getUserOrThrow(technicianId);
    request.recordProgress(technician, note);
    this.#addAuditEntry(technician, 'Request Update', requestId, note, 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async resolveRequest(requestId, technicianId, notes) {
    const request = this.#getRequestOrThrow(requestId);
    const technician = this.#getUserOrThrow(technicianId);
    request.resolveRequest(technician, notes);
    this.#addAuditEntry(technician, 'Resolution', requestId, notes, 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  async closeRequest(requestId, officerId) {
    const request = this.#getRequestOrThrow(requestId);
    const officer = this.#getUserOrThrow(officerId);
    request.closeRequest(officer);
    this.#addAuditEntry(officer, 'Closure', requestId, '', 'Success');
    await this.#persistRequests();
    await this.#persistAudit();
    return request;
  }

  #getRequestOrThrow(requestId) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    return request;
  }

  #getUserOrThrow(userId) {
    const user = this.findUserById(userId);
    if (!user) {
      throw new Error(`No user found with ID "${userId}".`);
    }
    return user;
  }

  // --- Credit: filtering and sorting ---

  filterByCategory(category) {
    return this.#requests.filter((r) => r.getCategory() === category);
  }

  filterByStatus(status) {
    return this.#requests.filter((r) => r.getStatus() === status);
  }

  filterByPriority(priority) {
    return this.#requests.filter((r) => r.getPriority() === priority);
  }

  filterByTechnician(technicianId) {
    return this.#requests.filter(
      (r) => r.getAssignedTechnician() && r.getAssignedTechnician().getUserId() === technicianId
    );
  }

  sortByDateSubmitted(requests = this.#requests) {
    return [...requests].sort((a, b) => a.getDateSubmitted() - b.getDateSubmitted());
  }

  sortByPriority(requests = this.#requests) {
    return [...requests].sort((a, b) => b.calculatePriorityScore() - a.calculatePriorityScore());
  }

  searchRequests(searchText) {
    const text = (searchText || '').toLowerCase();
    return this.#requests.filter(
      (r) =>
        r.getRequestId().toLowerCase().includes(text) ||
        r.getTitle().toLowerCase().includes(text)
    );
  }

  /**
   * Returns request summaries grouped by status.
   * @returns {Object<string, string[]>}
   */
  getRequestSummaryByStatus() {
    const summary = {};
    for (const request of this.#requests) {
      const status = request.getStatus();
      if (!summary[status]) {
        summary[status] = [];
      }
      summary[status].push(request.getRequestSummary());
    }
    return summary;
  }

  // --- Distinction: management reports (array algorithms) ---

  /**
   * Report: number of requests grouped by status.
   */
  reportRequestsByStatus() {
    return this.#requests.reduce((counts, r) => {
      const status = r.getStatus();
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Report: number of requests grouped by category.
   */
  reportRequestsByCategory() {
    return this.#requests.reduce((counts, r) => {
      const category = r.getCategory();
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Report: number of requests grouped by campus location.
   */
  reportVolumeByLocation() {
    return this.#requests.reduce((counts, r) => {
      const location = r.getCampusLocation();
      counts[location] = (counts[location] || 0) + 1;
      return counts;
    }, {});
  }

  /**
   * Report: average resolution time, in hours, across all requests that
   * have reached Resolved or Closed (measured from submission to last
   * update at the point of resolution/closure).
   */
  reportAverageResolutionHours() {
    const resolved = this.#requests.filter(
      (r) => r.getStatus() === 'Resolved' || r.getStatus() === 'Closed'
    );
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, r) => {
      const hours = (r.getDateUpdated() - r.getDateSubmitted()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    return Math.round((totalHours / resolved.length) * 100) / 100;
  }
}

module.exports = ServiceRequestManager;
