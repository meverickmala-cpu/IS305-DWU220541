'use strict';

const ServiceRequest = require('./ServiceRequest.js');

/**
 * MaintenanceRequest Class
 * A specialised ServiceRequest for Facilities Maintenance issues.
 * Calls the ServiceRequest constructor using super() (constructor chaining).
 */
class MaintenanceRequest extends ServiceRequest {
  #building;
  #roomNumber;
  #hazardLevel;
  #equipmentAffected;

  /**
   * @param {Object} commonRequestData - fields shared by all ServiceRequests
   * @param {Object} specialisedData
   * @param {string} specialisedData.building
   * @param {string} specialisedData.roomNumber
   * @param {string} specialisedData.hazardLevel
   * @param {string} specialisedData.equipmentAffected
   */
  constructor(commonRequestData, specialisedData) {
    super({ ...commonRequestData, category: 'Facilities Maintenance' });

    const { building, roomNumber, hazardLevel, equipmentAffected } = specialisedData;

    // Validate and initialise specialised fields.
    if (!building || building.trim().length === 0) {
      throw new Error('Building is required for a MaintenanceRequest.');
    }
    if (!roomNumber || roomNumber.toString().trim().length === 0) {
      throw new Error('Room number is required for a MaintenanceRequest.');
    }
    if (!hazardLevel || hazardLevel.trim().length === 0) {
      throw new Error('Hazard level is required for a MaintenanceRequest.');
    }
    if (!equipmentAffected || equipmentAffected.trim().length === 0) {
      throw new Error('Equipment affected is required for a MaintenanceRequest.');
    }

    this.#building = building;
    this.#roomNumber = roomNumber;
    this.#hazardLevel = hazardLevel;
    this.#equipmentAffected = equipmentAffected;
  }

  getBuilding() {
    return this.#building;
  }

  getRoomNumber() {
    return this.#roomNumber;
  }

  getHazardLevel() {
    return this.#hazardLevel;
  }

  getEquipmentAffected() {
    return this.#equipmentAffected;
  }
}

module.exports = MaintenanceRequest;
