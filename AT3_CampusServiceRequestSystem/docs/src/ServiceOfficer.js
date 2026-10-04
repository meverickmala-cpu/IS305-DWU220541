'use strict';

const User = require('./User.js');

/**
 * ServiceOfficer Class
 * A User who reviews requests, sets priority, and assigns Technicians.
 * Calls the User constructor using super() (constructor chaining).
 */
class ServiceOfficer extends User {
  #serviceSection;

  constructor(userId, firstName, lastName, email, serviceSection) {
    super(userId, firstName, lastName, email, 'ServiceOfficer');

    if (!serviceSection || serviceSection.trim().length === 0) {
      throw new Error('Service section is required for a ServiceOfficer.');
    }

    this.#serviceSection = serviceSection;
  }

  getServiceSection() {
    return this.#serviceSection;
  }
}

module.exports = ServiceOfficer;
