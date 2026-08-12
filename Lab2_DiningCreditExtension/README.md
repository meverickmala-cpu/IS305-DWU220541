# IS305 – Lab 2: Dining Booking Credit Extension

**Student Name:** Vincent MALA
**Student ID:** 220541
**GitHub Repository URL:** https://github.com/meverickmala-cpu/IS305-DWU220541.git

## How Lab 2 Extends Lab 1

Lab 1 built the `MealBooking` class with private fields, a constructor,
getters/setters, validation and cost calculation, and stored the
student's ID and name directly inside each booking. This created
duplication whenever the same student made more than one booking.

Lab 2 keeps `MealBooking.js` and `DiningApp.js` from Lab 1 and extends
them by introducing a separate `Student` class. A `Student` object now
holds the student's identity (ID, first name, last name), and each
`MealBooking` object stores a reference to a `Student` object instead
of duplicating their details. The same `Student` object can be
connected to several bookings.

## The Student Class

`Student.js` defines a class with three private fields — `#studentId`,
`#firstName` and `#lastName` — set through a constructor using `this`.
It provides getters and setters for all three fields; the setters throw
an `Error` if given an empty value, which calling code catches with
`try/catch`. Two methods are included: `getFullName()`, which returns
the first and last name combined, and `displayInfo()`, which returns a
clearly formatted block showing the student ID and full name.

## How Student and MealBooking Objects Are Connected

`MealBooking.js` was refactored so its constructor accepts a `student`
property instead of separate `studentId`/`studentName` values. It
stores the `Student` object in a private field (`#student`) and checks
that a valid `Student` instance (`instanceof Student`) was provided
before creating the booking. `getSummary()` reads the student's name
and ID directly from that connected object, so it always shows the
student's current details.

In `DiningApp.js`, `getOrCreateStudent()` looks up a `Student` by ID in
the `students` array. If that student already exists, the same object
is reused for the new booking; otherwise a new `Student` is created and
stored. Because every booking for a given student holds a reference to
the same object (not a copy), updating the student's name through
`updateStudentDetails()` immediately shows up in that student's booking
summaries — this is demonstrated by `displayBookingHistory()`, which
groups a student's bookings and re-displays their current name.

## Files Submitted

| File | Purpose |
|---|---|
| `Student.js` | Defines the `Student` class: private fields, constructor, getters/setters, `getFullName()`, `displayInfo()`. |
| `MealBooking.js` | Defines the `MealBooking` class, refactored to store and validate a connected `Student` object rather than duplicating student ID/name. Retains `validate()`, `calculateTotal()`, `confirmBooking()`, `cancelBooking()`, `getSummary()`. |
| `DiningApp.js` | Console application that creates/reuses `Student` objects, connects them to `MealBooking` objects, and adds a student booking history view and controlled student-detail updates. |
| `README.md` | This file — project overview, run instructions and test summary. |

## How to Run

1. Make sure [Node.js](https://nodejs.org) is installed.
2. Open a terminal in the `Lab2_DiningCreditExtension` folder.
3. Run:

```
node DiningApp.js
```

4. Follow the on-screen menu:
   - **1** – Create a booking (enter a Student ID; if that ID already
     exists you'll reuse the existing Student, otherwise you'll be
     asked for a first and last name to create a new one)
   - **2** – Confirm a booking
   - **3** – Cancel a booking
   - **4** – View all bookings
   - **5** – View a student's booking history
   - **6** – Update student details (first/last name)
   - **7** – Exit

## Meal Prices

| Meal Type | Price |
|---|---|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## Tests Completed

| Test | Steps | Result |
|---|---|---|
| **Valid Student object** | Option 1 → Student ID `DWU2026001`, first name `Maria`, last name `Kila`, then meal details | Student created and displayed via `displayInfo()`; booking created successfully. |
| **Invalid Student information** | Attempt to set an empty first, last name, or student ID via the `Student` setters | Rejected with an `Error` (e.g. `"First name cannot be empty."`), caught and shown without crashing the program. |
| **Student and booking integration** | Create two bookings for the same Student ID | Both bookings share the same `Student` object; each booking summary shows the connected student's current name and ID. |
| **Updated student name** | Option 6 → update `DWU2026001`'s last name, then Option 5 to view booking history | The new name appears immediately in the existing bookings' summaries, since they reference the same `Student` object. |
| **Booking history** | Option 5 → enter `DWU2026001` | All of that student's bookings are listed, with total number of bookings and combined cost. |
| **Duplicate booking** | Option 1 → re-enter the same Student ID, meal date and meal type as an existing booking | Booking rejected with a duplicate-booking error message. |
| **Invalid booking details** | Option 1 → invalid meal type or a quantity below 1 | Booking rejected by `validate()` with a clear error message. |

Additional manual checks performed:
- Confirming a booking changes its status from `Pending` to `Confirmed` (Option 2).
- Cancelling a booking changes its status to `Cancelled` (Option 3).
- Creating a `MealBooking` without a valid `Student` object is rejected by the constructor.
- Option 4 lists every booking currently stored in the array.

All errors are caught with `try/catch` so the program displays a clear
message instead of crashing.

## AI Tool Use

Claude (Anthropic) was used to help refactor the Lab 1 `MealBooking`
class into the Lab 2 Student/MealBooking design, write the `Student`
class, and draft this README, based on the Lab 2 assignment brief and
the Lab 1 code. All code was reviewed and tested before submission.
