/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date 09 September 2026
  Description: A JavaScript class representing a credit dining account.
  Extends DiningAccount through inheritance, chaining to the parent
  constructor with super(). Unlike a standard DiningAccount, the balance
  is allowed to fall below zero, but never past an approved credit
  limit. This class overrides payForMeal() so the same processPayment()
  call used for every other account type still works correctly here —
  this is the polymorphic part of the assignment.
*/

const DiningAccount = require("./DiningAccount");

class CreditDiningAccount extends DiningAccount {
  #creditLimit;

  // Constructor chaining: account number and opening balance go to the
  // DiningAccount constructor via super(); the credit limit (specific to
  // this subclass) is validated and set afterwards.
  constructor(accountNumber, openingBalance = 0, creditLimit = 0) {
    super(accountNumber, openingBalance);

    if (typeof creditLimit !== "number" || creditLimit < 0) {
      throw new Error("Credit limit cannot be negative.");
    }
    this.#creditLimit = creditLimit;
  }

  // ---------- Getters / Setters ----------
  get creditLimit() {
    return this.#creditLimit;
  }

  set creditLimit(limit) {
    if (typeof limit !== "number" || limit < 0) {
      throw new Error("Credit limit cannot be negative.");
    }
    this.#creditLimit = limit;
  }

  // ---------- Methods ----------

  // Overrides DiningAccount.payForMeal(). The balance may fall below
  // zero but never below -creditLimit. Returns true/false so
  // MealBooking.processPayment() can treat every account type the same
  // way, without knowing which subclass it is talking to.
  payForMeal(amount, description = "Meal payment") {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("A payment amount must be greater than zero.");
    }

    const resultingBalance = this._getBalance() - amount;

    if (resultingBalance < -this.#creditLimit) {
      return false; // Payment would exceed the approved credit limit.
    }

    this._setBalance(resultingBalance);
    this._recordTransaction("Meal Payment", amount, description);
    return true;
  }

  // Overrides the base class label so displayAccountSummary() (inherited
  // from DiningAccount) shows the correct account type polymorphically.
  getAccountType() {
    return "CreditDiningAccount";
  }
}

module.exports = CreditDiningAccount;
