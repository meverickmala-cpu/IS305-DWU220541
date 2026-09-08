/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 09 September 2026
  Description: A JavaScript class representing a Student. Stores the
  student's identity (ID, first name, last name) separately from meal
  booking data, so the same Student object can be connected to several
  MealBooking objects without duplicating their details. Lab 3 adds the
  ability to assign one DiningAccount (or any of its subclasses) to a
  Student, so a booking's payment can be routed to that account.
*/

// Required so assignDiningAccount() can validate that the object passed
// in is really a DiningAccount or one of its subclasses (instanceof
// covers RewardsDiningAccount and CreditDiningAccount too, since both
// extend DiningAccount).
const DiningAccount = require("./DiningAccount");

class Student {
  #studentId;
  #firstName;
  #lastName;
  #diningAccount;

  constructor(studentId, firstName, lastName) {
    this.#studentId = studentId;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#diningAccount = null;
  }

  // ---------- Getters ----------
  get studentId() {
    return this.#studentId;
  }

  get firstName() {
    return this.#firstName;
  }

  get lastName() {
    return this.#lastName;
  }

  // ---------- Setters ----------
  set studentId(id) {
    if (!id || id.toString().trim() === "") {
      throw new Error("Student ID cannot be empty.");
    }
    this.#studentId = id;
  }

  set firstName(name) {
    if (!name || name.trim() === "") {
      throw new Error("First name cannot be empty.");
    }
    this.#firstName = name;
  }

  set lastName(name) {
    if (!name || name.trim() === "") {
      throw new Error("Last name cannot be empty.");
    }
    this.#lastName = name;
  }

  get diningAccount() {
    return this.#diningAccount;
  }

  // ---------- Methods ----------

  // Assigns a dining account to this student. Accepts a DiningAccount
  // object or an object from any of its subclasses (RewardsDiningAccount,
  // CreditDiningAccount), since instanceof follows the inheritance chain.
  assignDiningAccount(account) {
    if (!(account instanceof DiningAccount)) {
      throw new Error("A valid DiningAccount (or subclass) object is required.");
    }
    this.#diningAccount = account;
    return this.#diningAccount;
  }

  // Returns the student's first and last name as one value.
  getFullName() {
    return `${this.#firstName} ${this.#lastName}`;
  }

  // Returns a clearly formatted block showing the student ID and full name.
  displayInfo() {
    return (
      "==========================================\n" +
      "              STUDENT DETAILS\n" +
      "==========================================\n" +
      `Student ID: ${this.#studentId}\n` +
      `Student Name: ${this.getFullName()}\n` +
      "=========================================="
    );
  }
}

module.exports = Student;
