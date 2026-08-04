# AT1 – Dining Meal Booking Feature

**Student Name:** Vincent MALA
**Student ID:** 220541
**GitHub Repository URL:** https://github.com/meverickmala-cpu/IS305-DWU220541.git

## Description

A console-based Dining Meal Booking feature for DWU Dining Services. The
program lets a student enter meal-booking details, validates the input,
calculates the total cost, prevents duplicate bookings, and displays a
clear booking receipt. It also supports confirming and cancelling a
booking. All data is stored temporarily in a JavaScript array — no
database, file storage or ORM is used.

## Files Submitted

| File | Purpose |
|---|---|
| `MealBooking.js` | Defines the `MealBooking` class: private fields, constructor, getters/setters, `validate()`, `calculateTotal()`, `confirmBooking()`, `cancelBooking()` and `getSummary()`. |
| `DiningApp.js` | Console application that imports `MealBooking`, collects input with `readline/promises`, stores bookings in an array, and displays booking receipts. |
| `README.md` | This file — project overview, run instructions and test summary. |

## How to Run

1. Make sure [Node.js](https://nodejs.org) is installed.
2. Open a terminal in the `AT1_DiningFeature` folder.
3. Run:

```
node DiningApp.js
```

4. Follow the on-screen menu:
   - **1** – Create a booking
   - **2** – Confirm a booking
   - **3** – Cancel a booking
   - **4** – View all bookings
   - **5** – Exit

## Meal Prices

| Meal Type | Price |
|---|---|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## Summary of Tests Completed

| Test | Steps | Result |
|---|---|---|
| **Valid booking** | Option 1 → enter Student ID `DWU2026001`, name `Lewa Mahn`, date `2026-07-18`, meal type `Lunch`, quantity `2`, dietary note `No peanuts` | Booking created; receipt displayed with `Total cost: K30.00` and status `Pending`. |
| **Invalid booking** | Option 1 → leave Student ID blank | Booking rejected with the message `Student ID is required.` No booking added to the array. |
| **Duplicate booking** | Option 1 → re-enter the same Student ID, meal date and meal type as the valid booking above | Booking rejected with a duplicate-booking error message. No second entry added. |

Additional manual checks performed:
- Confirming a booking changes its status from `Pending` to `Confirmed` (Option 2).
- Cancelling a booking changes its status to `Cancelled` (Option 3).
- Entering an invalid meal type (not Breakfast/Lunch/Dinner) or a quantity below 1 is rejected by `validate()`.
- `Option 4` correctly lists every booking currently stored in the array.

All errors are caught with `try/catch` so the program displays a clear
message instead of crashing.

