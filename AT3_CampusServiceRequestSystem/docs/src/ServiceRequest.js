'use strict';

const ServiceOfficer = require('./ServiceOfficer.js');
const Technician = require('./Technician.js');

/**
 * ServiceRequest Class
 * Represents a campus service request submitted by a Requester.
 * Pass-level requirements: private fields, constructor, getters, controlled
 * setters, validate(), updateDetails(), cancelRequest(), getRequestSummary().
 *
 * Credit Extension adds: the full controlled status workflow, role-based
 * permissions, a request history array, and overridable
 * calculatePriorityScore() / getTargetResolutionHours() methods.
 */

const REQUIRED_CATEGORIES = [
  'ICT Support',
  'Facilities Maintenance',
  'Cleaning and Sanitation',
  'General Campus Service',
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const PASS_STATUSES = ['Submitted', 'Cancelled'];

// Full Credit-level status workflow.
const FULL_STATUSES = [
  'Submitted',
  'Reviewed',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Cancelled',
];

const PRIORITY_SCORES = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
const PRIORITY_TARGET_HOURS = { Low: 72, Medium: 48, High: 24, Urgent: 4 };

class ServiceRequest {
  #requestId;
  #requester;
  #title;
  #description;
  #campusLocation;
  #category;
  #priority;
  #status;
  #dateSubmitted;
  #dateUpdated;
  #assignedTechnician;
  #history;

  /**
   * @param {Object} commonRequestData
   * @param {string} commonRequestData.requestId
   * @param {User} commonRequestData.requester
   * @param {string} commonRequestData.title
   * @param {string} commonRequestData.description
   * @param {string} commonRequestData.campusLocation
   * @param {string} commonRequestData.category
   * @param {string} commonRequestData.priority
   */
  constructor(commonRequestData) {
    const { requestId, requester, title, description, campusLocation, category, priority } =
      commonRequestData;
    this.#requestId = requestId;
    this.#requester = requester;
    this.#title = title;
    this.#description = description;
    this.#campusLocation = campusLocation;
    this.#category = category;
    this.#priority = priority;
    this.#status = 'Submitted';
    this.#dateSubmitted = new Date();
    this.#dateUpdated = new Date();
    this.#assignedTechnician = null;
    this.#history = [];
  }

  // Getters
  getRequestId() {
    return this.#requestId;
  }

  getRequester() {
    return this.#requester;
  }

  getTitle() {
    return this.#title;
  }

  getDescription() {
    return this.#description;
  }

  getCampusLocation() {
    return this.#campusLocation;
  }

  getCategory() {
    return this.#category;
  }

  getPriority() {
    return this.#priority;
  }

  getStatus() {
    return this.#status;
  }

  getDateSubmitted() {
    return this.#dateSubmitted;
  }

  getDateUpdated() {
    return this.#dateUpdated;
  }

  getAssignedTechnician() {
    return this.#assignedTechnician;
  }

  getHistory() {
    return [...this.#history];
  }

  /**
   * Records a request history entry. Internal helper used by every
   * status-changing / workflow action.
   */
  #addHistoryEntry(previousStatus, newStatus, actionPerformed, actor, comment) {
    this.#history.push({
      previousStatus,
      newStatus,
      actionPerformed,
      actorId: actor.getUserId(),
      actorRole: actor.getUserType(),
      comment: comment || '',
      dateTime: new Date(),
    });
  }

  /**
   * Validates the request's data.
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate() {
    const errors = [];

    if (!this.#requestId || this.#requestId.toString().trim().length === 0) {
      errors.push('Request ID is required.');
    }
    if (!this.#requester) {
      errors.push('A requester is required.');
    }
    if (!this.#title || this.#title.trim().length === 0) {
      errors.push('Request title is required.');
    }
    if (!this.#description || this.#description.trim().length === 0) {
      errors.push('Request description is required.');
    }
    if (!this.#campusLocation || this.#campusLocation.trim().length === 0) {
      errors.push('Campus location is required.');
    }
    if (!this.#category || !REQUIRED_CATEGORIES.includes(this.#category)) {
      errors.push(`Category must be one of: ${REQUIRED_CATEGORIES.join(', ')}.`);
    }
    if (!this.#priority || !VALID_PRIORITIES.includes(this.#priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Updates eligible fields on a request. Only permitted while the request
   * is still in the Submitted status, and only by the original requester.
   */
  updateDetails(userId, changes = {}) {
    if (this.#requester.getUserId() !== userId) {
      throw new Error('Only the original requester may update this request.');
    }
    if (this.#status !== 'Submitted') {
      throw new Error(`Request cannot be updated while status is "${this.#status}".`);
    }

    if (changes.title !== undefined) this.#title = changes.title;
    if (changes.description !== undefined) this.#description = changes.description;
    if (changes.campusLocation !== undefined) this.#campusLocation = changes.campusLocation;
    if (changes.category !== undefined) {
      if (!REQUIRED_CATEGORIES.includes(changes.category)) {
        throw new Error(`Unsupported category: ${changes.category}`);
      }
      this.#category = changes.category;
    }
    if (changes.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(changes.priority)) {
        throw new Error(`Unsupported priority: ${changes.priority}`);
      }
      this.#priority = changes.priority;
    }

    this.#dateUpdated = new Date();
  }

  /**
   * Cancels the request. Only permitted while Submitted, and only by the
   * original requester.
   */
  cancelRequest(userId) {
    if (this.#requester.getUserId() !== userId) {
      throw new Error('Only the original requester may cancel this request.');
    }
    if (this.#status !== 'Submitted') {
      throw new Error(`Request cannot be cancelled while status is "${this.#status}".`);
    }
    const previousStatus = this.#status;
    this.#status = 'Cancelled';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(previousStatus, this.#status, 'Cancel Request', this.#requester, '');
  }

  /**
   * Service Officer reviews a Submitted request and sets its priority.
   */
  reviewRequest(officer, priority) {
    if (!(officer instanceof ServiceOfficer)) {
      throw new Error('Only a Service Officer may review a request.');
    }
    if (this.#status !== 'Submitted') {
      throw new Error(`Request cannot be reviewed while status is "${this.#status}".`);
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new Error(`Unsupported priority: ${priority}`);
    }
    const previousStatus = this.#status;
    this.#priority = priority;
    this.#status = 'Reviewed';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(
      previousStatus,
      this.#status,
      'Review Request',
      officer,
      `Priority set to ${priority}`
    );
  }

  /**
   * Service Officer assigns a Technician to a Reviewed request.
   */
  assignTechnician(officer, technician) {
    if (!(officer instanceof ServiceOfficer)) {
      throw new Error('Only a Service Officer may assign a Technician.');
    }
    if (!(technician instanceof Technician)) {
      throw new Error('The assignee must be a Technician.');
    }
    if (this.#status !== 'Reviewed') {
      throw new Error(`Request cannot be assigned while status is "${this.#status}".`);
    }
    const previousStatus = this.#status;
    this.#assignedTechnician = technician;
    this.#status = 'Assigned';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(
      previousStatus,
      this.#status,
      'Assign Technician',
      officer,
      `Assigned to ${technician.getFullName()} (${technician.getUserId()})`
    );
  }

  /**
   * Assigned Technician begins work on an Assigned request.
   */
  beginWork(technician) {
    this.#assertIsAssignedTechnician(technician);
    if (this.#status !== 'Assigned') {
      throw new Error(`Work cannot begin while status is "${this.#status}".`);
    }
    const previousStatus = this.#status;
    this.#status = 'In Progress';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(previousStatus, this.#status, 'Begin Work', technician, '');
  }

  /**
   * Assigned Technician records a progress note while work is In Progress.
   * Does not change the request's status.
   */
  recordProgress(technician, note) {
    this.#assertIsAssignedTechnician(technician);
    if (this.#status !== 'In Progress') {
      throw new Error(`Progress cannot be recorded while status is "${this.#status}".`);
    }
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(this.#status, this.#status, 'Record Progress', technician, note);
  }

  /**
   * Assigned Technician resolves an In Progress request.
   */
  resolveRequest(technician, notes) {
    this.#assertIsAssignedTechnician(technician);
    if (this.#status !== 'In Progress') {
      throw new Error(`Request cannot be resolved while status is "${this.#status}".`);
    }
    const previousStatus = this.#status;
    this.#status = 'Resolved';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(previousStatus, this.#status, 'Resolve Request', technician, notes || '');
  }

  /**
   * Service Officer verifies and closes a Resolved request.
   */
  closeRequest(officer) {
    if (!(officer instanceof ServiceOfficer)) {
      throw new Error('Only a Service Officer may close a request.');
    }
    if (this.#status !== 'Resolved') {
      throw new Error(`Request cannot be closed while status is "${this.#status}".`);
    }
    const previousStatus = this.#status;
    this.#status = 'Closed';
    this.#dateUpdated = new Date();
    this.#addHistoryEntry(previousStatus, this.#status, 'Close Request', officer, '');
  }

  #assertIsAssignedTechnician(technician) {
    if (!(technician instanceof Technician)) {
      throw new Error('Only a Technician may perform this action.');
    }
    if (!this.#assignedTechnician || this.#assignedTechnician.getUserId() !== technician.getUserId()) {
      throw new Error('Only the assigned Technician may perform this action.');
    }
  }

  // --- Helpers available to subclasses (Distinction: abstract-style base) ---
  // ServiceRequest is abstract-style: calculatePriorityScore(),
  // getTargetResolutionHours() and getRequestSummary() below throw unless
  // overridden. These three helpers give subclasses a priority-driven
  // baseline to build on without duplicating the lookup tables.

  basePriorityScoreFromPriority() {
    return PRIORITY_SCORES[this.#priority] || 0;
  }

  baseTargetResolutionHoursFromPriority() {
    return PRIORITY_TARGET_HOURS[this.#priority] || 48;
  }

  baseRequestSummary() {
    return (
      `[${this.#requestId}] ${this.#title} (${this.#category}, Priority: ${this.#priority}) ` +
      `- Status: ${this.#status} - Submitted by: ${this.#requester.getFullName()}`
    );
  }

  /**
   * Abstract-style method - every ServiceRequest subclass must override
   * this. The base implementation throws a clear error if a subclass has
   * not supplied its own behaviour.
   */
  calculatePriorityScore() {
    throw new Error(
      `calculatePriorityScore() is not implemented by ${this.constructor.name}. ` +
        'Every ServiceRequest subclass must override this method.'
    );
  }

  /**
   * Abstract-style method - every ServiceRequest subclass must override
   * this. The base implementation throws a clear error if a subclass has
   * not supplied its own behaviour.
   */
  getTargetResolutionHours() {
    throw new Error(
      `getTargetResolutionHours() is not implemented by ${this.constructor.name}. ` +
        'Every ServiceRequest subclass must override this method.'
    );
  }

  /**
   * Abstract-style method - every ServiceRequest subclass must override
   * this. The base implementation throws a clear error if a subclass has
   * not supplied its own behaviour.
   */
  getRequestSummary() {
    throw new Error(
      `getRequestSummary() is not implemented by ${this.constructor.name}. ` +
        'Every ServiceRequest subclass must override this method.'
    );
  }

  // --- Distinction: JSON persistence support ---

  /**
   * Restores persisted state onto a freshly constructed instance. Used
   * only by ServiceRequestFactory when reloading saved data - it bypasses
   * normal workflow transition validation because the object already
   * legitimately progressed through valid transitions before being saved.
   */
  restoreState({ status, dateSubmitted, dateUpdated, assignedTechnician } = {}) {
    if (status) this.#status = status;
    if (dateSubmitted) this.#dateSubmitted = new Date(dateSubmitted);
    if (dateUpdated) this.#dateUpdated = new Date(dateUpdated);
    if (assignedTechnician !== undefined) this.#assignedTechnician = assignedTechnician;
  }

  /**
   * Restores a request's history array (loaded separately from
   * requestHistory.json) onto this instance.
   */
  restoreHistory(historyEntries = []) {
    this.#history = historyEntries.map((h) => ({ ...h, dateTime: new Date(h.dateTime) }));
  }

  /**
   * Plain-object representation of the request's common fields, suitable
   * for JSON persistence. Subclasses override this to add their
   * specialised fields, calling super.toJSON() first.
   */
  toJSON() {
    return {
      requestType: this.constructor.name,
      requestId: this.#requestId,
      requesterId: this.#requester ? this.#requester.getUserId() : null,
      title: this.#title,
      description: this.#description,
      campusLocation: this.#campusLocation,
      category: this.#category,
      priority: this.#priority,
      status: this.#status,
      assignedTechnicianId: this.#assignedTechnician ? this.#assignedTechnician.getUserId() : null,
      dateSubmitted: this.#dateSubmitted,
      dateUpdated: this.#dateUpdated,
    };
  }
}

module.exports = ServiceRequest;
module.exports.REQUIRED_CATEGORIES = REQUIRED_CATEGORIES;
module.exports.VALID_PRIORITIES = VALID_PRIORITIES;
module.exports.PASS_STATUSES = PASS_STATUSES;
module.exports.FULL_STATUSES = FULL_STATUSES;
