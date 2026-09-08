/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 26 August 2026
  Description: A JavaScript class representing a rewards dining account.
  Extends DiningAccount through inheritance, chaining to the parent
  constructor with super() and adding a reward rate. Rewards are
  calculated as a percentage of the current balance and can be applied
  to top the account up.
*/

const DiningAccount = require("./DiningAccount");

class RewardsDiningAccount extends DiningAccount {
  #rewardRate;

  // Constructor chaining: the account number and opening balance are
  // handed straight to the DiningAccount constructor via super() before
  // the reward rate (specific to this subclass) is initialised.
  constructor(accountNumber, openingBalance = 0, rewardRate = 0) {
    super(accountNumber, openingBalance);

    if (typeof rewardRate !== "number" || rewardRate < 0) {
      throw new Error("Reward rate cannot be negative.");
    }
    this.#rewardRate = rewardRate;
  }

  // ---------- Getters / Setters ----------
  get rewardRate() {
    return this.#rewardRate;
  }

  set rewardRate(rate) {
    if (typeof rate !== "number" || rate < 0) {
      throw new Error("Reward rate cannot be negative.");
    }
    this.#rewardRate = rate;
  }

  // ---------- Methods ----------

  // Reward = current balance x reward rate / 100.
  calculateReward() {
    return (this._getBalance() * this.#rewardRate) / 100;
  }

  // Adds the calculated reward to the account and records the transaction.
  applyReward() {
    const reward = this.calculateReward();
    if (reward <= 0) {
      return 0;
    }
    this._setBalance(this._getBalance() + reward);
    this._recordTransaction("Reward", reward, `Reward applied at ${this.#rewardRate}%`);
    return reward;
  }

  // Overrides the base class label so displayAccountSummary() (inherited
  // from DiningAccount) shows the correct account type polymorphically.
  getAccountType() {
    return "RewardsDiningAccount";
  }
}

module.exports = RewardsDiningAccount;
