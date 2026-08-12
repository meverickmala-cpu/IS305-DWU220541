/*
  Program: Dining Meal Booking Feature — Lab 2 Part 1 Checkpoint
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 12 August 2026
  Description: A Node.js console application that uses the MealBooking class
  to create, validate, confirm, cancel and display DWU student dining
  bookings. All bookings are stored in a JavaScript array in memory;
  no database or file storage is used.

  Lab 2 Part 1 checkpoint: adds the ability to create and display a
  Student object (Task 2 of Part 1). The meal booking flow below is
  still the Lab 1 version and does not yet use Student objects — that
  connection is completed in Part 2.
*/

const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const MealBooking = require("./MealBooking");
const Student = require("./Student");

const rl = readline.createInterface({ input, output });
const bookings = []; // Stores all created MealBooking objects

// Prevents a duplicate booking for the same student, date and meal type.
function isDuplicate(studentId, mealDate, mealType) {
  return bookings.some(
    (b) => b.studentId === studentId && b.mealDate === mealDate && b.mealType === mealType
  );
}

async function createBooking() {
  console.log("\n==========================================");
  console.log("        DWU DINING MEAL BOOKING");
  console.log("==========================================\n");

  const studentId = (await rl.question("Student ID: ")).trim();
  const studentName = (await rl.question("Student name: ")).trim();
  const mealDate = (await rl.question("Meal date (YYYY-MM-DD): ")).trim();
  const mealType = (await rl.question("Meal type (Breakfast/Lunch/Dinner): ")).trim();
  const quantityInput = (await rl.question("Quantity: ")).trim();
  const dietaryNote = (await rl.question("Dietary note (optional): ")).trim();

  const quantity = parseInt(quantityInput, 10);

  try {
    if (isDuplicate(studentId, mealDate, mealType)) {
      throw new Error(
        `Duplicate booking rejected — ${studentId} already has a ${mealType} booking on ${mealDate}.`
      );
    }

    const booking = new MealBooking({
      studentId,
      studentName,
      mealDate,
      mealType,
      quantity,
      dietaryNote,
    });

    booking.validate();

    bookings.push(booking);

    console.log("\n==========================================");
    console.log("              BOOKING CREATED");
    console.log(booking.getSummary());
  } catch (error) {
    console.log(`\nBooking rejected: ${error.message}`);
  }
}

async function updateBookingStatus(action) {
  const studentId = (await rl.question("\nEnter Student ID: ")).trim();
  const mealDate = (await rl.question("Enter meal date: ")).trim();
  const mealType = (await rl.question("Enter meal type: ")).trim();

  const booking = bookings.find(
    (b) => b.studentId === studentId && b.mealDate === mealDate && b.mealType === mealType
  );

  if (!booking) {
    console.log("\nNo matching booking found.");
    return;
  }

  try {
    if (action === "confirm") {
      booking.confirmBooking();
    } else {
      booking.cancelBooking();
    }
    console.log("\nBooking status updated.");
    console.log(booking.getSummary());
  } catch (error) {
    console.log(`\nAction failed: ${error.message}`);
  }
}

function viewAllBookings() {
  if (bookings.length === 0) {
    console.log("\nNo bookings have been made yet.");
    return;
  }
  console.log(`\nTotal bookings: ${bookings.length}`);
  bookings.forEach((b, i) => {
    console.log(`\nBooking ${i + 1}`);
    console.log(b.getSummary());
  });
}

// Lab 2 Part 1, Task 2: collects a student ID, first name and last name,
// creates one Student object from that input, and displays it.
async function createStudentProfile() {
  console.log("\n==========================================");
  console.log("            CREATE STUDENT PROFILE");
  console.log("==========================================\n");

  try {
    const studentId = (await rl.question("Student ID: ")).trim();
    const firstName = (await rl.question("First name: ")).trim();
    const lastName = (await rl.question("Last name: ")).trim();

    const student = new Student(studentId, firstName, lastName);

    console.log("\n" + student.displayInfo());
  } catch (error) {
    console.log(`\nCould not create student: ${error.message}`);
  }
}

async function mainMenu() {
  let running = true;

  while (running) {
    console.log("\n------ DWU DINING MEAL BOOKING MENU ------");
    console.log("1. Create a booking");
    console.log("2. Confirm a booking");
    console.log("3. Cancel a booking");
    console.log("4. View all bookings");
    console.log("5. Create a Student profile");
    console.log("6. Exit");

    const choice = (await rl.question("Choose an option (1-6): ")).trim();

    switch (choice) {
      case "1":
        await createBooking();
        break;
      case "2":
        await updateBookingStatus("confirm");
        break;
      case "3":
        await updateBookingStatus("cancel");
        break;
      case "4":
        viewAllBookings();
        break;
      case "5":
        await createStudentProfile();
        break;
      case "6":
        running = false;
        break;
      default:
        console.log("\nInvalid option. Please choose 1-6.");
    }
  }

  console.log("\nThank you for using DWU Dining Meal Booking. Goodbye!");
  rl.close();
}

mainMenu().catch((error) => {
  console.log(`\nAn unexpected error occurred: ${error.message}`);
  rl.close();
});
