'use strict';

const User = require('./User.js');

/**
 * Technician Class
 * A User who is assigned requests and carries out the resolution work.
 * Calls the User constructor using super() (constructor chaining).
 */
class Technician extends User {
  #technicalSpeciality;

  constructor(userId, firstName, lastName, email, technicalSpeciality) {
    super(userId, firstName, lastName, email, 'Technician');

    if (!technicalSpeciality || technicalSpeciality.trim().length === 0) {
      throw new Error('Technical speciality is required for a Technician.');
    }

    this.#technicalSpeciality = technicalSpeciality;
  }

  getTechnicalSpeciality() {
    return this.#technicalSpeciality;
  }
}

module.exports = Technician;
