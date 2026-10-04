'use strict';

/**
 * ServiceRequest Class
 * Represents a campus service request submitted by a Requester.
 * Pass-level requirements: private fields, constructor, getters, controlled
 * setters, validate(), updateDetails(), cancelRequest(), getRequestSummary().
 *
 * Note: at Pass level only the Submitted and Cancelled statuses are used.
 * The full Submitted -> Reviewed -> Assigned -> In Progress -> Resolved ->
 * Closed workflow is introduced in the Credit Extension.
 */

const REQUIRED_CATEGORIES = [
  'ICT Support',
  'Facilities Maintenance',
  'Cleaning and Sanitation',
  'General Campus Service',
];

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const PASS_STATUSES = ['Submitted', 'Cancelled'];

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
    this.#status = 'Cancelled';
    this.#dateUpdated = new Date();
  }

  getRequestSummary() {
    return (
      `[${this.#requestId}] ${this.#title} (${this.#category}, Priority: ${this.#priority}) ` +
      `- Status: ${this.#status} - Submitted by: ${this.#requester.getFullName()}`
    );
  }
}

module.exports = ServiceRequest;
module.exports.REQUIRED_CATEGORIES = REQUIRED_CATEGORIES;
module.exports.VALID_PRIORITIES = VALID_PRIORITIES;
module.exports.PASS_STATUSES = PASS_STATUSES;
