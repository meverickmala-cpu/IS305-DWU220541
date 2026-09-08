# IS305 – Lab 3: Dining Account Distinction Extension

**Student Name:** Vincent MALA
**Student ID:** 220541
**GitHub Repository URL:** https://github.com/meverickmala-cpu/IS305-DWU220541.git

## How Lab 3 Extends Labs 1 and 2

Lab 1 built the `MealBooking` class (private fields, constructor, methods,
arrays). Lab 2 added the `Student` class and connected `Student` objects to
`MealBooking` objects so student details are stored once and reused. Lab 3
does not create a new application — it extends the same working Dining Meal
Booking application with a dining-account inheritance hierarchy:

- `DiningAccount.js` — a new base class representing a standard dining
  account (deposit, pay for a meal only when funds are sufficient).
- `RewardsDiningAccount.js` — extends `DiningAccount`; adds a reward rate
  and reward calculation.
- `CreditDiningAccount.js` — extends `DiningAccount`; adds a credit limit
  and overrides `payForMeal()` so the balance can go negative within that
  limit.
- `Student.js` — extended with the ability to hold one dining account.
- `MealBooking.js` — extended with `processPayment()`, which routes a
  booking's payment through whichever dining account is connected to the
  student.
- `DiningApp.js` — extended to create/assign dining accounts, pay for
  bookings through them, and to run the required demonstrations and tests
  automatically on startup.

## Class Inheritance Hierarchy

```
DiningAccount (base class)
├── RewardsDiningAccount
└── CreditDiningAccount
```

`DiningAccount` holds the fields and behaviour every account type shares:
`#accountNumber`, `#balance`, `#transactions`, plus `deposit()`,
`payForMeal()`, `getBalance()`, `getTransactions()` and
`displayAccountSummary()`. `RewardsDiningAccount` and `CreditDiningAccount`
both extend `DiningAccount` with `extends`, so they inherit all of this
automatically and only add what makes them different — a reward rate and
reward methods for one, a credit limit and an overridden payment method for
the other.

## Constructor Chaining

Every subclass constructor calls `super(accountNumber, openingBalance)` as
its first statement, before doing anything of its own. This hands the
shared setup (account number, balance, transaction list) back to the
`DiningAccount` constructor instead of duplicating that logic in every
subclass:

```js
// RewardsDiningAccount
constructor(accountNumber, openingBalance = 0, rewardRate = 0) {
  super(accountNumber, openingBalance);
  this.#rewardRate = rewardRate;
}
```

`CreditDiningAccount` follows the same pattern with `creditLimit` in place
of `rewardRate`.

## Method Overriding and Polymorphism

`CreditDiningAccount` overrides `payForMeal()` so a payment can push the
balance below zero, as long as it does not go past `-creditLimit`. Every
other account type keeps the base class version, which rejects a payment
outright if funds are insufficient.

`getAccountType()` is also overridden by each subclass (`"DiningAccount"`,
`"RewardsDiningAccount"`, `"CreditDiningAccount"`), so the inherited
`displayAccountSummary()` method automatically shows the correct label for
whichever object calls it — it never needs to know which subclass it's
running on.

Polymorphism is demonstrated by putting one of each account type into a
single array and calling the same method on all of them:

```js
for (const account of diningAccounts) {
  account.displayAccountSummary();
}
```

The same call produces different, correct behaviour for each object.
`MealBooking.processPayment(diningAccount)` uses the same principle — it
only ever calls `diningAccount.payForMeal(...)` and never checks which
subclass it received; each account's own overridden method decides whether
the payment succeeds.

## Simulated Overloading in JavaScript

JavaScript does not support true method or constructor overloading (having
two versions of the same method name with a different number of
parameters). This project simulates it using default parameters:

```js
constructor(accountNumber, openingBalance = 0) { ... }
deposit(amount, description = "No description provided") { ... }
```

`new DiningAccount("DA001")` and `new DiningAccount("DA002", 1000)` both
work with the one constructor; `account.deposit(500)` and
`account.deposit(500, "Weekly meal allowance")` both work with the one
method. The default value stands in for the "missing" version of the call
that true overloading would otherwise provide.

## How Student, MealBooking and DiningAccount Objects Are Connected

`Student.js` now has a private `#diningAccount` field, set through
`assignDiningAccount(account)`, which checks `account instanceof
DiningAccount` — this accepts a plain `DiningAccount` or any of its
subclasses, since `instanceof` follows the inheritance chain. A student
can hold one dining account at a time.

`MealBooking.processPayment(diningAccount)` calculates the booking total,
calls `diningAccount.payForMeal(total, description)`, and then:
- confirms the booking and marks it paid if payment succeeds;
- leaves the booking `Pending` and charges nothing if payment fails;
- refuses to run at all if the booking is already paid or cancelled, which
  is what prevents a confirmed booking from being charged twice.

In `DiningApp.js`, option 7 creates a new account of the chosen type and
assigns it to a student; option 8 finds a booking and pays for it through
that student's assigned account.

## Tests Completed and Results

The application runs 8 required tests automatically on startup
(`runLab3Demonstrations()` in `DiningApp.js`). All 8 currently pass:

| # | Test | Expected Result | Result |
|---|---|---|---|
| 1 | Standard account payment, sufficient funds | Payment succeeds | PASS |
| 2 | Standard account payment, insufficient funds | Payment rejected, balance unchanged | PASS |
| 3 | Rewards calculation and application | Correct reward calculated and added to balance | PASS |
| 4 | Credit account payment within limit | Payment accepted, balance may go negative | PASS |
| 5 | Credit account payment exceeding limit | Payment rejected | PASS |
| 6 | Polymorphic account processing | Same method call produces correct behaviour per account type | PASS |
| 7 | Booking payment | Successful payment confirms the booking | PASS |
| 8 | Duplicate payment | A confirmed/paid booking cannot be charged again | PASS |

Additional manual checks:
- An empty account number, a negative opening balance, a non-positive
  deposit, and a negative reward rate or credit limit are all rejected
  with a clear `Error`.
- `getTransactions()` returns a copy of the transaction array, so the
  internal history cannot be modified from outside the class.
- The full integration example (Student `DWU2026001` / Maria Kila with a
  `RewardsDiningAccount`, a Dinner booking for 2, `processPayment()`)
  matches the assignment brief's example output: total cost K40.00,
  payment successful, booking confirmed, remaining balance K60.00.

## Files Submitted

| File | Purpose |
|---|---|
| `Student.js` | `Student` class; Lab 3 adds `#diningAccount`, `assignDiningAccount()`, and a getter. |
| `MealBooking.js` | `MealBooking` class; Lab 3 adds `#isPaid` and `processPayment(diningAccount)`. |
| `DiningAccount.js` | New base class: private fields, constructor with default opening balance, `deposit()`, `payForMeal()`, `getBalance()`, `getTransactions()`, `displayAccountSummary()`, `displayTransactionHistory()`. |
| `RewardsDiningAccount.js` | Extends `DiningAccount`; adds `#rewardRate`, `calculateReward()`, `applyReward()`. |
| `CreditDiningAccount.js` | Extends `DiningAccount`; adds `#creditLimit`, overrides `payForMeal()`. |
| `DiningApp.js` | Console application; adds account creation/assignment, booking payment, and an automatic demonstration/test run on startup. |
| `Lab3Part1Demo.js` | Standalone script reproducing the two required Part 1 demonstrations. |
| `README.md` | This file. |

## How to Run

1. Make sure [Node.js](https://nodejs.org) is installed.
2. Open a terminal in the `Lab3_DiningDistinctionExtension` folder.
3. Run:

```
node DiningApp.js
```

This immediately prints the required Part 1 and Part 2 demonstrations and
the 8 required tests, then opens the interactive menu:

- **1** – Create a booking
- **2** – Confirm a booking
- **3** – Cancel a booking
- **4** – View all bookings
- **5** – View a student's booking history
- **6** – Update student details
- **7** – Assign a dining account to a student (standard, rewards or credit)
- **8** – Pay for a booking through the student's assigned account
- **9** – Exit

To see just the Part 1 demonstrations on their own:

```
node Lab3Part1Demo.js
```

## Meal Prices

| Meal Type | Price |
|---|---|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## AI Tool Use

Claude (Anthropic) was used to help design and implement the
`DiningAccount` inheritance hierarchy, extend `Student.js` and
`MealBooking.js`, integrate everything into `DiningApp.js`, and draft this
README, based on the Lab 3 assignment brief and  the two working
Lab 1/Lab 2 code. All code was reviewed and tested before
submission.
