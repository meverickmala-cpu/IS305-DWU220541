'use strict';

const ServiceRequest = require('./ServiceRequest.js');

/**
 * ICTSupportRequest Class
 * A specialised ServiceRequest for ICT Support issues.
 * Calls the ServiceRequest constructor using super() (constructor chaining).
 */
class ICTSupportRequest extends ServiceRequest {
  #deviceType;
  #systemName;
  #faultType;
  #networkImpact;

  /**
   * @param {Object} commonRequestData - fields shared by all ServiceRequests
   * @param {Object} specialisedData
   * @param {string} specialisedData.deviceType
   * @param {string} specialisedData.systemName
   * @param {string} specialisedData.faultType
   * @param {string} specialisedData.networkImpact
   */
  constructor(commonRequestData, specialisedData) {
    super({ ...commonRequestData, category: 'ICT Support' });

    const { deviceType, systemName, faultType, networkImpact } = specialisedData;

    // Validate and initialise specialised fields.
    if (!deviceType || deviceType.trim().length === 0) {
      throw new Error('Device type is required for an ICTSupportRequest.');
    }
    if (!systemName || systemName.trim().length === 0) {
      throw new Error('System name is required for an ICTSupportRequest.');
    }
    if (!faultType || faultType.trim().length === 0) {
      throw new Error('Fault type is required for an ICTSupportRequest.');
    }
    if (!networkImpact || networkImpact.trim().length === 0) {
      throw new Error('Network impact is required for an ICTSupportRequest.');
    }

    this.#deviceType = deviceType;
    this.#systemName = systemName;
    this.#faultType = faultType;
    this.#networkImpact = networkImpact;
  }

  getDeviceType() {
    return this.#deviceType;
  }

  getSystemName() {
    return this.#systemName;
  }

  getFaultType() {
    return this.#faultType;
  }

  getNetworkImpact() {
    return this.#networkImpact;
  }
}

module.exports = ICTSupportRequest;
