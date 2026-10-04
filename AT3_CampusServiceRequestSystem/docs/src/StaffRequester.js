'use strict';

const User = require('./User.js');

/**
 * StaffRequester Class
 * A User who is a staff member submitting campus service requests.
 * Calls the User constructor using super() (constructor chaining).
 */
class StaffRequester extends User {
  #department;

  constructor(userId, firstName, lastName, email, department) {
    super(userId, firstName, lastName, email, 'StaffRequester');

    if (!department || department.trim().length === 0) {
      throw new Error('Department is required for a StaffRequester.');
    }

    this.#department = department;
  }

  getDepartment() {
    return this.#department;
  }

  toJSON() {
    return { ...super.toJSON(), specialisedData: { department: this.#department } };
  }
}

module.exports = StaffRequester;
