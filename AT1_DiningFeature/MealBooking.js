/*
  Program: Dining Meal Booking Feature
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 04 August 2026
  Description: A JavaScript class demonstrating classes, objects, constructors,
  private fields, getters/setters and methods for the DWU Dining Meal Booking
  feature. All booking data is held in memory only (no database is used).
*/

const MEAL_PRICES = {
  Breakfast: 10.0,
  Lunch: 15.0,
  Dinner: 20.0,
};

class MealBooking {
  #studentId;
  #studentName;
  #mealDate;
  #mealType;
  #quantity;
  #dietaryNote;
  #bookingStatus;

  constructor({ studentId, studentName, mealDate, mealType, quantity, dietaryNote }) {
    this.#studentId = studentId;
    this.#studentName = studentName;
    this.#mealDate = mealDate;
    this.#mealType = mealType;
    this.#quantity = quantity;
    this.#dietaryNote = dietaryNote && dietaryNote.trim() !== "" ? dietaryNote : "None";
    this.#bookingStatus = "Pending"; // default status
  }

  // ---------- Getters ----------
  get studentId() {
    return this.#studentId;
  }

  get studentName() {
    return this.#studentName;
  }

  get mealDate() {
    return this.#mealDate;
  }

  get mealType() {
    return this.#mealType;
  }

  get quantity() {
    return this.#quantity;
  }

  get dietaryNote() {
    return this.#dietaryNote;
  }

  get bookingStatus() {
    return this.#bookingStatus;
  }

  // ---------- Setters ----------
  set studentName(name) {
    if (!name || name.trim() === "") {
      throw new Error("Student name cannot be empty.");
    }
    this.#studentName = name;
  }

  set mealDate(date) {
    if (!date || date.trim() === "") {
      throw new Error("Meal date cannot be empty.");
    }
    this.#mealDate = date;
  }

  set mealType(type) {
    if (!MEAL_PRICES.hasOwnProperty(type)) {
      throw new Error("Meal type must be Breakfast, Lunch or Dinner.");
    }
    this.#mealType = type;
  }

  set quantity(qty) {
    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error("Quantity must be a whole number of at least 1.");
    }
    this.#quantity = qty;
  }

  set dietaryNote(note) {
    this.#dietaryNote = note && note.trim() !== "" ? note : "None";
  }

  // ---------- Methods ----------

  // Rejects missing or invalid booking information.
  validate() {
    const errors = [];

    if (!this.#studentId || this.#studentId.toString().trim() === "") {
      errors.push("Student ID is required.");
    }
    if (!this.#studentName || this.#studentName.trim() === "") {
      errors.push("Student name is required.");
    }
    if (!this.#mealDate || this.#mealDate.trim() === "") {
      errors.push("Meal date is required.");
    }
    if (!MEAL_PRICES.hasOwnProperty(this.#mealType)) {
      errors.push("Meal type must be Breakfast, Lunch or Dinner.");
    }
    if (!Number.isInteger(this.#quantity) || this.#quantity < 1) {
      errors.push("Quantity must be a whole number of at least 1.");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    return true;
  }

  // Returns the selected meal price multiplied by quantity.
  calculateTotal() {
    const price = MEAL_PRICES[this.#mealType];
    if (price === undefined) {
      throw new Error("Cannot calculate total: invalid meal type.");
    }
    return price * this.#quantity;
  }

  // Changes the booking status from Pending to Confirmed.
  confirmBooking() {
    if (this.#bookingStatus === "Cancelled") {
      throw new Error("Cannot confirm a booking that has already been cancelled.");
    }
    this.#bookingStatus = "Confirmed";
    return this.#bookingStatus;
  }

  // Changes the booking status to Cancelled.
  cancelBooking() {
    this.#bookingStatus = "Cancelled";
    return this.#bookingStatus;
  }

  // Returns a clear booking receipt.
  getSummary() {
    const total = this.calculateTotal().toFixed(2);
    return (
      "==========================================\n" +
      "              BOOKING RECEIPT\n" +
      "==========================================\n" +
      `Student: ${this.#studentName} (${this.#studentId})\n` +
      `Meal: ${this.#mealType} x ${this.#quantity}\n` +
      `Date: ${this.#mealDate}\n` +
      `Dietary note: ${this.#dietaryNote}\n` +
      `Status: ${this.#bookingStatus}\n` +
      `Total cost: K${total}\n` +
      "=========================================="
    );
  }
}

module.exports = MealBooking;
module.exports.MEAL_PRICES = MEAL_PRICES;
