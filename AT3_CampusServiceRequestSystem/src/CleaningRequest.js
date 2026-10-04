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
}

module.exports = CleaningRequest;
