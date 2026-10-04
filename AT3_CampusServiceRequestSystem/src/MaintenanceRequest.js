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

  /**
   * Overridden: a High hazard level raises the effective priority score
   * to the maximum (Urgent-equivalent), since safety issues take
   * precedence over the originally selected priority.
   */
  calculatePriorityScore() {
    const baseScore = super.basePriorityScoreFromPriority();
    return this.#hazardLevel === 'High' ? 4 : baseScore;
  }

  /**
   * Overridden: a High hazard level forces a short target resolution
   * time regardless of the base priority-driven target.
   */
  getTargetResolutionHours() {
    if (this.#hazardLevel === 'High') {
      return 2;
    }
    return super.baseTargetResolutionHoursFromPriority();
  }

  /**
   * Overridden: adds Facilities Maintenance-specific detail to the base
   * summary.
   */
  getRequestSummary() {
    return (
      `${super.baseRequestSummary()} ` +
      `| Maintenance - Building: ${this.#building}, Room: ${this.#roomNumber}, ` +
      `Hazard: ${this.#hazardLevel}, Equipment: ${this.#equipmentAffected}`
    );
  }

  /**
   * Overridden: adds Maintenance-specific fields for JSON persistence.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      specialisedData: {
        building: this.#building,
        roomNumber: this.#roomNumber,
        hazardLevel: this.#hazardLevel,
        equipmentAffected: this.#equipmentAffected,
      },
    };
  }
}

module.exports = MaintenanceRequest;
