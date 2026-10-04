# IS305 – Object-Oriented Programming Labs

**Student Name:** Vincent MALA
**Student ID:** 220541
**Institution:** Divine Word University (DWU)
**GitHub Repository:** https://github.com/meverickmala-cpu/IS305-DWU220541

This repository contains my work for IS305 – Object-Oriented Programming:
three labs that build on one another (a Dining Meal Booking application)
and the AT3 major project (a Campus Service Request Management System).
All projects are written in JavaScript and run on Node.js.

## Repository Contents

| Folder | Description |
|---|---|
| [`AT1_DiningFeature`](./AT1_DiningFeature) | **Lab 1** – Console-based Dining Meal Booking feature. `MealBooking` class with private fields, validation, cost calculation, duplicate-booking prevention, and confirm/cancel. |
| [`Lab2_DiningCreditExtension`](./Lab2_DiningCreditExtension) | **Lab 2 (Credit extension)** – Adds a `Student` class and connects `Student` objects to `MealBooking` objects so student details are stored once and reused. |
| [`Lab3_DiningDistinctionExtension`](./Lab3_DiningDistinctionExtension) | **Lab 3 (Distinction extension)** – Adds a `DiningAccount` inheritance hierarchy (`RewardsDiningAccount`, `CreditDiningAccount`) with constructor chaining, method overriding, polymorphism and payment for bookings. |
| [`AT3_CampusServiceRequestSystem`](./AT3_CampusServiceRequestSystem) | **AT3 Major Project** – Node.js console application for submitting, tracking and managing campus service requests, with role-based workflows, JSON persistence, reports and automated tests. |

Each folder has its own `README.md` with full details, run instructions and
test results.

## How the Work Builds Up

The three dining labs form a single application that grows with each lab:

1. **Lab 1 – `MealBooking`:** private fields, constructor, getters/setters, validation, cost calculation, and bookings stored in an array.
2. **Lab 2 – `Student`:** student identity moves out of the booking into its own class. Each booking holds a reference to a `Student` object, so one student can be connected to many bookings and a name update shows up everywhere.
3. **Lab 3 – `DiningAccount`:** a base account class with two subclasses. `RewardsDiningAccount` adds a reward rate and `CreditDiningAccount` overrides `payForMeal()` to allow a balance within a credit limit. `MealBooking.processPayment()` works with any account type through polymorphism.

**AT3** is a separate, larger project that applies the same OOP concepts
(classes, inheritance, polymorphism, encapsulation) to a different domain.

## Requirements

- [Node.js](https://nodejs.org) v18 or later
- npm (needed for AT3 only)

## How to Run

### AT1, Lab 2 and Lab 3 (Dining Meal Booking)

Open a terminal in the relevant folder and run:

```
node DiningApp.js
```

Then follow the on-screen menu. Lab 3 also runs its 8 required tests
automatically on startup. To run only the Lab 3 tests:

```
node Lab3Tests.js
```

### AT3 (Campus Service Request Management System)

Open a terminal in `AT3_CampusServiceRequestSystem` and run:

```
npm install
node src/CampusServiceApp.js
```

To run the automated tests:

```
npm test
```

## Meal Prices (Dining Labs)

| Meal Type | Price |
|---|---|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## AI Use Declaration

Claude (Anthropic) was used as a development assistant across these
projects: helping design and refactor class implementations from my own
design decisions and the assessment briefs, generating UML diagrams,
drafting documentation and READMEs, and writing and running automated
tests. All code and documentation was reviewed and tested before
submission, and I am able to explain and defend every part of it.
