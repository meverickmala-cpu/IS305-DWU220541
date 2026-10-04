'use strict';

const ServiceRequest = require('./ServiceRequest.js');

/**
 * GeneralServiceRequest Class
 * Handles the "General Campus Service" category, which the brief lists as
 * one of the four required categories but does not assign a named
 * specialised class. Since ServiceRequest is an abstract-style base class
 * (its calculatePriorityScore(), getTargetResolutionHours() and
 * getRequestSummary() throw unless overridden), this class exists purely
 * to give that category a concrete, priority-driven implementation of the
 * three required methods - it adds no specialised fields of its own.
 */
class GeneralServiceRequest extends ServiceRequest {
  constructor(commonRequestData) {
    super({ ...commonRequestData, category: 'General Campus Service' });
  }

  calculatePriorityScore() {
    return super.basePriorityScoreFromPriority();
  }

  getTargetResolutionHours() {
    return super.baseTargetResolutionHoursFromPriority();
  }

  getRequestSummary() {
    return super.baseRequestSummary();
  }

  toJSON() {
    return { ...super.toJSON(), specialisedData: {} };
  }
}

module.exports = GeneralServiceRequest;
