'use strict';

const User = require('./User.js');
const StudentRequester = require('./StudentRequester.js');
const StaffRequester = require('./StaffRequester.js');
const ServiceOfficer = require('./ServiceOfficer.js');
const Technician = require('./Technician.js');

/**
 * UserFactory
 * Recreates the correct specialised User subclass from plain data loaded
 * from users.json (Distinction: Restore Saved Objects).
 */
class UserFactory {
  static createFromData(savedData) {
    const { userType, userId, firstName, lastName, email, specialisedData = {} } = savedData;

    switch (userType) {
      case 'StudentRequester':
        return new StudentRequester(
          userId,
          firstName,
          lastName,
          email,
          specialisedData.programme,
          specialisedData.yearLevel
        );
      case 'StaffRequester':
        return new StaffRequester(userId, firstName, lastName, email, specialisedData.department);
      case 'ServiceOfficer':
        return new ServiceOfficer(
          userId,
          firstName,
          lastName,
          email,
          specialisedData.serviceSection
        );
      case 'Technician':
        return new Technician(
          userId,
          firstName,
          lastName,
          email,
          specialisedData.technicalSpeciality
        );
      default:
        // Administrator or any other type without a dedicated subclass.
        return new User(userId, firstName, lastName, email, userType);
    }
  }
}

module.exports = UserFactory;
