'use strict';

/**
 * User Class
 * Represents a user of the Campus Service Request Management System.
 * Pass-level requirements: private fields, constructor, getters, controlled
 * setters, getFullName(), validate(), displayInfo().
 */

// Updated at Credit level to match the specialised User subclasses
// (StudentRequester, StaffRequester, ServiceOfficer, Technician) introduced
// by the Credit Extension, plus Administrator from the system's Main Users.
const VALID_USER_TYPES = [
  'StudentRequester',
  'StaffRequester',
  'ServiceOfficer',
  'Technician',
  'Administrator',
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class User {
  #userId;
  #firstName;
  #lastName;
  #email;
  #userType;

  constructor(userId, firstName, lastName, email, userType) {
    this.#userId = userId;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#email = email;
    this.#userType = userType;
  }

  // Getters
  getUserId() {
    return this.#userId;
  }

  getFirstName() {
    return this.#firstName;
  }

  getLastName() {
    return this.#lastName;
  }

  getEmail() {
    return this.#email;
  }

  getUserType() {
    return this.#userType;
  }

  // Controlled setters
  setFirstName(firstName) {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name cannot be empty.');
    }
    this.#firstName = firstName;
  }

  setLastName(lastName) {
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty.');
    }
    this.#lastName = lastName;
  }

  setEmail(email) {
    if (!EMAIL_PATTERN.test(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    this.#email = email;
  }

  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  /**
   * Validates the user's data.
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate() {
    const errors = [];

    if (!this.#userId || this.#userId.toString().trim().length === 0) {
      errors.push('User ID is required.');
    }
    if (!this.#firstName || this.#firstName.trim().length === 0) {
      errors.push('First name is required.');
    }
    if (!this.#lastName || this.#lastName.trim().length === 0) {
      errors.push('Last name is required.');
    }
    if (!this.#email || !EMAIL_PATTERN.test(this.#email)) {
      errors.push('A valid email address is required.');
    }
    if (!this.#userType || !VALID_USER_TYPES.includes(this.#userType)) {
      errors.push(`User type must be one of: ${VALID_USER_TYPES.join(', ')}.`);
    }

    return { valid: errors.length === 0, errors };
  }

  displayInfo() {
    return (
      `User ID: ${this.#userId}\n` +
      `Name: ${this.getFullName()}\n` +
      `Email: ${this.#email}\n` +
      `User Type: ${this.#userType}`
    );
  }
}

module.exports = User;
module.exports.VALID_USER_TYPES = VALID_USER_TYPES;
