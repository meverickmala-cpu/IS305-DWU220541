'use strict';

/**
 * ServiceRequestManager Class
 * Manages Users and ServiceRequests using in-memory JavaScript arrays
 * (Pass level - no database, no file persistence yet).
 */

class ServiceRequestManager {
  #users;
  #requests;

  constructor() {
    this.#users = [];
    this.#requests = [];
  }

  registerUser(user) {
    const validation = user.validate();
    if (!validation.valid) {
      throw new Error(`Cannot register user: ${validation.errors.join(' ')}`);
    }
    if (this.findUserById(user.getUserId())) {
      throw new Error(`A user with ID "${user.getUserId()}" is already registered.`);
    }
    this.#users.push(user);
    return user;
  }

  findUserById(userId) {
    return this.#users.find((u) => u.getUserId() === userId) || null;
  }

  submitRequest(request) {
    const validation = request.validate();
    if (!validation.valid) {
      throw new Error(`Cannot submit request: ${validation.errors.join(' ')}`);
    }
    if (this.findRequestById(request.getRequestId())) {
      throw new Error(`A request with ID "${request.getRequestId()}" already exists.`);
    }
    this.#requests.push(request);
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

  updateRequest(requestId, userId, changes) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    request.updateDetails(userId, changes);
    return request;
  }

  cancelRequest(requestId, userId) {
    const request = this.findRequestById(requestId);
    if (!request) {
      throw new Error(`No request found with ID "${requestId}".`);
    }
    request.cancelRequest(userId);
    return request;
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
}

module.exports = ServiceRequestManager;
