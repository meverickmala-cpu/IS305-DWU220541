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

  /**
   * Overridden: widespread network impact raises the effective priority
   * score by one point above the base priority score.
   */
  calculatePriorityScore() {
    const baseScore = super.calculatePriorityScore();
    const impact = this.#networkImpact.toLowerCase();
    const isWidespread = impact.includes('campus-wide') || impact.includes('widespread');
    return isWidespread ? baseScore + 1 : baseScore;
  }

  /**
   * Overridden: widespread network impact halves the target resolution
   * time compared to the base priority-driven target.
   */
  getTargetResolutionHours() {
    const baseHours = super.getTargetResolutionHours();
    const impact = this.#networkImpact.toLowerCase();
    const isWidespread = impact.includes('campus-wide') || impact.includes('widespread');
    return isWidespread ? Math.max(1, Math.round(baseHours / 2)) : baseHours;
  }

  /**
   * Overridden: adds ICT-specific detail to the base summary.
   */
  getRequestSummary() {
    return (
      `${super.getRequestSummary()} ` +
      `| ICT Support - Device: ${this.#deviceType}, System: ${this.#systemName}, ` +
      `Fault: ${this.#faultType}, Network Impact: ${this.#networkImpact}`
    );
  }
}

module.exports = ICTSupportRequest;
