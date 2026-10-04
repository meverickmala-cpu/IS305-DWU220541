'use strict';

const ServiceRequest = require('./ServiceRequest.js');

/**
 * CleaningRequest Class
 * A specialised ServiceRequest for Cleaning and Sanitation issues.
 * Calls the ServiceRequest constructor using super() (constructor chaining).
 */
class CleaningRequest extends ServiceRequest {
  #cleaningArea;
  #hygieneRisk;
  #serviceType;
  #preferredServiceTime;

  /**
   * @param {Object} commonRequestData - fields shared by all ServiceRequests
   * @param {Object} specialisedData
   * @param {string} specialisedData.cleaningArea
   * @param {string} specialisedData.hygieneRisk
   * @param {string} specialisedData.serviceType
   * @param {string} specialisedData.preferredServiceTime
   */
  constructor(commonRequestData, specialisedData) {
    super({ ...commonRequestData, category: 'Cleaning and Sanitation' });

    const { cleaningArea, hygieneRisk, serviceType, preferredServiceTime } = specialisedData;

    // Validate and initialise specialised fields.
    if (!cleaningArea || cleaningArea.trim().length === 0) {
      throw new Error('Cleaning area is required for a CleaningRequest.');
    }
    if (!hygieneRisk || hygieneRisk.trim().length === 0) {
      throw new Error('Hygiene risk is required for a CleaningRequest.');
    }
    if (!serviceType || serviceType.trim().length === 0) {
      throw new Error('Service type is required for a CleaningRequest.');
    }
    if (!preferredServiceTime || preferredServiceTime.trim().length === 0) {
      throw new Error('Preferred service time is required for a CleaningRequest.');
    }

    this.#cleaningArea = cleaningArea;
    this.#hygieneRisk = hygieneRisk;
    this.#serviceType = serviceType;
    this.#preferredServiceTime = preferredServiceTime;
  }

  getCleaningArea() {
    return this.#cleaningArea;
  }

  getHygieneRisk() {
    return this.#hygieneRisk;
  }

  getServiceType() {
    return this.#serviceType;
  }

  getPreferredServiceTime() {
    return this.#preferredServiceTime;
  }

  /**
   * Overridden: a High hygiene risk raises the effective priority score
   * by one point above the base priority score.
   */
  calculatePriorityScore() {
    const baseScore = super.basePriorityScoreFromPriority();
    return this.#hygieneRisk === 'High' ? baseScore + 1 : baseScore;
  }

  /**
   * Overridden: a High hygiene risk shortens the target resolution time
   * compared to the base priority-driven target.
   */
  getTargetResolutionHours() {
    const baseHours = super.baseTargetResolutionHoursFromPriority();
    if (this.#hygieneRisk === 'High') {
      return Math.min(4, baseHours);
    }
    return baseHours;
  }

  /**
   * Overridden: adds Cleaning-specific detail to the base summary.
   */
  getRequestSummary() {
    return (
      `${super.baseRequestSummary()} ` +
      `| Cleaning - Area: ${this.#cleaningArea}, Hygiene Risk: ${this.#hygieneRisk}, ` +
      `Service Type: ${this.#serviceType}, Preferred Time: ${this.#preferredServiceTime}`
    );
  }

  /**
   * Overridden: adds Cleaning-specific fields for JSON persistence.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      specialisedData: {
        cleaningArea: this.#cleaningArea,
        hygieneRisk: this.#hygieneRisk,
        serviceType: this.#serviceType,
        preferredServiceTime: this.#preferredServiceTime,
      },
    };
  }
}

module.exports = CleaningRequest;
