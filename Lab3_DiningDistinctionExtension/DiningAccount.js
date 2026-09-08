/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 26 August 2026
  Description: A JavaScript class representing a standard DWU dining
  account. Students deposit funds into the account and pay for meals
  only when sufficient funds are available. This is the base class for
  the account inheritance hierarchy — RewardsDiningAccount and
  CreditDiningAccount both extend DiningAccount and reuse its deposit,
  balance and transaction-history behaviour. All account data is held
  in memory only (no database is used).
*/

class DiningAccount {
  #accountNumber;
  #balance;
  #transactions;

  // The default value for openingBalance simulates constructor
  // overloading: new DiningAccount("DA001") and
  // new DiningAccount("DA002", 1000) both work with the same constructor.
  constructor(accountNumber, openingBalance = 0) {
    if (!accountNumber || accountNumber.toString().trim() === "") {
      throw new Error("Account number cannot be empty.");
    }
    if (typeof openingBalance !== "number" || openingBalance < 0) {
      throw new Error("Opening balance cannot be negative.");
    }

    this.#accountNumber = accountNumber;
    this.#balance = openingBalance;
    this.#transactions = [];

    if (openingBalance > 0) {
      this.#recordTransaction("Deposit", openingBalance, "Opening balance");
    }
  }

  // ---------- Getters ----------
  get accountNumber() {
    return this.#accountNumber;
  }

  get balance() {
    return this.#balance;
  }

  // ---------- Protected-style helpers for subclasses ----------
  // Subclasses cannot reach private fields directly, so these
  // protected-style helpers let RewardsDiningAccount and
  // CreditDiningAccount read/adjust balance and log transactions
  // without breaking encapsulation.
  _getBalance() {
    return this.#balance;
  }

  _setBalance(newBalance) {
    this.#balance = newBalance;
  }

  _recordTransaction(type, amount, description) {
    this.#recordTransaction(type, amount, description);
  }

  #recordTransaction(type, amount, description) {
    this.#transactions.push({
      type,
      amount,
      description: description && description.trim() !== "" ? description : "No description provided",
      dateTime: new Date().toISOString(),
      balanceAfter: this.#balance,
    });
  }

  // ---------- Methods ----------

  // Adds money to the account. description is optional (default
  // parameter), which simulates method overloading — deposit(500) and
  // deposit(500, "Weekly meal allowance") both work.
  deposit(amount, description = "No description provided") {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("A deposit amount must be greater than zero.");
    }

    this.#balance += amount;
    this.#recordTransaction("Deposit", amount, description);
    return this.#balance;
  }

  // Deducts money for a meal payment only when sufficient funds are
  // available. Returns true when the payment succeeds and false when it
  // is rejected, so calling code can react without relying on exceptions
  // for an expected outcome.
  payForMeal(amount, description = "Meal payment") {
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("A payment amount must be greater than zero.");
    }

    if (amount > this.#balance) {
      return false; // Insufficient funds — standard account cannot go negative.
    }

    this.#balance -= amount;
    this.#recordTransaction("Meal Payment", amount, description);
    return true;
  }

  // Returns the current account balance.
  getBalance() {
    return this.#balance;
  }

  // Returns a safe copy of the transaction history so the internal
  // array cannot be modified from outside the class.
  getTransactions() {
    return this.#transactions.map((t) => ({ ...t }));
  }

  // Returns the account type label. Subclasses override this so
  // displayAccountSummary() can stay polymorphic (see below).
  getAccountType() {
    return "DiningAccount";
  }

  // Displays the account number, account type and current balance.
  // Subclasses (RewardsDiningAccount, CreditDiningAccount) do not need
  // to override this — it works polymorphically by calling
  // getAccountType(), which each subclass overrides instead.
  displayAccountSummary() {
    return (
      "==========================================\n" +
      `        ${this.getAccountType().toUpperCase()}\n` +
      "==========================================\n" +
      `Account Number: ${this.#accountNumber}\n` +
      `Account Type: ${this.getAccountType()}\n` +
      `Current Balance: K${this.#balance.toFixed(2)}\n` +
      "=========================================="
    );
  }

  // Prints a full transaction history report for this account.
  displayTransactionHistory() {
    if (this.#transactions.length === 0) {
      return "No transactions recorded for this account.";
    }

    let report =
      "==========================================\n" +
      "            TRANSACTION HISTORY\n" +
      "==========================================\n";

    this.#transactions.forEach((t, i) => {
      const dt = new Date(t.dateTime).toLocaleString();
      report +=
        `${i + 1}. ${t.type} - K${t.amount.toFixed(2)}\n` +
        `   Description: ${t.description}\n` +
        `   Date/Time: ${dt}\n` +
        `   Balance: K${t.balanceAfter.toFixed(2)}\n\n`;
    });

    report += `Total Transactions: ${this.#transactions.length}\n`;
    report += "==========================================";
    return report;
  }
}

module.exports = DiningAccount;
