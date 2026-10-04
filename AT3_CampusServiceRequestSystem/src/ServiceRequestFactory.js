'use strict';

const ICTSupportRequest = require('./ICTSupportRequest.js');
const MaintenanceRequest = require('./MaintenanceRequest.js');
const CleaningRequest = require('./CleaningRequest.js');
const GeneralServiceRequest = require('./GeneralServiceRequest.js');

/**
 * ServiceRequestFactory
 * Recreates the correct specialised ServiceRequest subclass from plain
 * data loaded from serviceRequests.json (Distinction: Restore Saved
 * Objects). The restored objects continue to support specialised
 * validation, overridden methods and polymorphic behaviour exactly like
 * freshly-created ones.
 *
 * @param {Object} savedData - one entry from serviceRequests.json
 * @param {User} requester - the resolved requester User object (looked up
 *   by savedData.requesterId before calling this factory)
 * @param {User|null} assignedTechnician - the resolved Technician object
 *   (looked up by savedData.assignedTechnicianId), or null if unassigned
 */
class ServiceRequestFactory {
  static createFromData(savedData, requester, assignedTechnician = null) {
    const {
      requestType,
      requestId,
      title,
      description,
      campusLocation,
      category,
      priority,
      status,
      dateSubmitted,
      dateUpdated,
      specialisedData = {},
    } = savedData;

    const commonRequestData = {
      requestId,
      requester,
      title,
      description,
      campusLocation,
      category,
      priority,
    };

    let request;
    switch (requestType) {
      case 'ICTSupportRequest':
        request = new ICTSupportRequest(commonRequestData, specialisedData);
        break;
      case 'MaintenanceRequest':
        request = new MaintenanceRequest(commonRequestData, specialisedData);
        break;
      case 'CleaningRequest':
        request = new CleaningRequest(commonRequestData, specialisedData);
        break;
      default:
        request = new GeneralServiceRequest(commonRequestData);
    }

    // The constructor above always sets status to "Submitted" - restore
    // the real persisted state (status, dates, technician assignment).
    request.restoreState({ status, dateSubmitted, dateUpdated, assignedTechnician });

    return request;
  }
}

module.exports = ServiceRequestFactory;
