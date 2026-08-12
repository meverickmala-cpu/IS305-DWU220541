/*
  Program: Dining Meal Booking Feature — Lab 2 Credit Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 12 August 2026
  Description: A JavaScript class representing a Student. Stores the
  student's identity (ID, first name, last name) separately from meal
  booking data, so the same Student object can be connected to several
  MealBooking objects without duplicating their details.
*/

class Student {
  #studentId;
  #firstName;
  #lastName;

  constructor(studentId, firstName, lastName) {
    this.#studentId = studentId;
    this.#firstName = firstName;
    this.#lastName = lastName;
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

  // ---------- Methods ----------

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
