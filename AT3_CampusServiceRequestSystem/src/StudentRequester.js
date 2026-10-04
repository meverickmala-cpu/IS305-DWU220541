'use strict';

const User = require('./User.js');

/**
 * StudentRequester Class
 * A User who is a student submitting campus service requests.
 * Calls the User constructor using super() (constructor chaining).
 */
class StudentRequester extends User {
  #programme;
  #yearLevel;

  constructor(userId, firstName, lastName, email, programme, yearLevel) {
    super(userId, firstName, lastName, email, 'StudentRequester');

    if (!programme || programme.trim().length === 0) {
      throw new Error('Programme is required for a StudentRequester.');
    }
    if (!yearLevel || yearLevel.toString().trim().length === 0) {
      throw new Error('Year level is required for a StudentRequester.');
    }

    this.#programme = programme;
    this.#yearLevel = yearLevel;
  }

  getProgramme() {
    return this.#programme;
  }

  getYearLevel() {
    return this.#yearLevel;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      specialisedData: { programme: this.#programme, yearLevel: this.#yearLevel },
    };
  }
}

module.exports = StudentRequester;
