/*
  Program: Dining Meal Booking Feature — Lab 2 Credit Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 09 August 2026
  Description: A Node.js console application that uses the Student and
  MealBooking classes together to create, validate, confirm, cancel and
  display DWU student dining bookings. A Student object stores identity
  (ID, first name, last name) once; MealBooking objects hold a reference
  to that Student instead of duplicating their details. All bookings and
  students are stored in JavaScript arrays in memory; no database or file
  storage is used.
*/

const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const Student = require("./Student");
const MealBooking = require("./MealBooking");

const rl = readline.createInterface({ input, output });
const bookings = []; // Stores all created MealBooking objects
const students = []; // Stores all created Student objects (one per student ID)

// Finds an existing Student object by ID, if one has already been created.
function findStudent(studentId) {
  return students.find((s) => s.studentId === studentId);
}

// Prevents a duplicate booking for the same student, date and meal type.
function isDuplicate(studentId, mealDate, mealType) {
  return bookings.some(
    (b) => b.studentId === studentId && b.mealDate === mealDate && b.mealType === mealType
  );
}

// Collects student details and either reuses an existing Student object
// (same ID) or creates a new one. This is what allows one Student to be
// connected to several MealBooking objects without duplicating their info.
async function getOrCreateStudent() {
  const studentId = (await rl.question("Student ID: ")).trim();

  const existing = findStudent(studentId);
  if (existing) {
    console.log(`\nExisting student found: ${existing.getFullName()}`);
    return existing;
  }

  const firstName = (await rl.question("First name: ")).trim();
  const lastName = (await rl.question("Last name: ")).trim();

  const student = new Student(studentId, firstName, lastName);
  students.push(student);
  return student;
}

async function createBooking() {
  console.log("\n==========================================");
  console.log("        DWU DINING MEAL BOOKING");
  console.log("==========================================\n");

  try {
    const student = await getOrCreateStudent();
    console.log("\n" + student.displayInfo());

    const mealDate = (await rl.question("\nMeal date (YYYY-MM-DD): ")).trim();
    const mealType = (await rl.question("Meal type (Breakfast/Lunch/Dinner): ")).trim();
    const quantityInput = (await rl.question("Quantity: ")).trim();
    const dietaryNote = (await rl.question("Dietary note (optional): ")).trim();

    const quantity = parseInt(quantityInput, 10);

    if (isDuplicate(student.studentId, mealDate, mealType)) {
      throw new Error(
        `Duplicate booking rejected — ${student.studentId} already has a ${mealType} booking on ${mealDate}.`
      );
    }

    const booking = new MealBooking({
      student,
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

// Displays one student's details once, followed by every booking that
// belongs to them, then the total number of bookings and their combined cost.
function displayBookingHistory(student, allBookings) {
  const studentBookings = allBookings.filter((b) => b.studentId === student.studentId);

  console.log("\n==========================================");
  console.log("            STUDENT INFORMATION");
  console.log("==========================================");
  console.log(`Student ID: ${student.studentId}`);
  console.log(`Student Name: ${student.getFullName()}`);

  console.log("\n==========================================");
  console.log("              BOOKING HISTORY");
  console.log("==========================================");

  if (studentBookings.length === 0) {
    console.log("No bookings found for this student.");
    console.log("==========================================");
    return;
  }

  let combinedCost = 0;

  studentBookings.forEach((b, i) => {
    const cost = b.calculateTotal();
    combinedCost += cost;
    console.log(`\n${i + 1}. ${b.mealType} - ${b.mealDate}`);
    console.log(`   Quantity: ${b.quantity}`);
    console.log(`   Status: ${b.bookingStatus}`);
    console.log(`   Cost: K${cost.toFixed(2)}`);
  });

  console.log(`\nTotal Bookings: ${studentBookings.length}`);
  console.log(`Combined Cost: K${combinedCost.toFixed(2)}`);
  console.log("==========================================");
}

async function viewBookingHistory() {
  const studentId = (await rl.question("\nEnter Student ID: ")).trim();
  const student = findStudent(studentId);

  if (!student) {
    console.log("\nNo student found with that ID.");
    return;
  }

  displayBookingHistory(student, bookings);
}

// Lets a student's first or last name be updated through the Student
// class's own setters. Because every MealBooking for that student holds a
// reference to the same Student object (not a copy), the change appears
// immediately in that student's booking summaries.
async function updateStudentDetails() {
  const studentId = (await rl.question("\nEnter Student ID to update: ")).trim();
  const student = findStudent(studentId);

  if (!student) {
    console.log("\nNo student found with that ID.");
    return;
  }

  console.log(`\nCurrent name: ${student.getFullName()}`);
  const newFirstName = (await rl.question("New first name (leave blank to keep current): ")).trim();
  const newLastName = (await rl.question("New last name (leave blank to keep current): ")).trim();

  try {
    if (newFirstName !== "") {
      student.firstName = newFirstName;
    }
    if (newLastName !== "") {
      student.lastName = newLastName;
    }
    console.log("\nStudent details updated.");
    console.log(student.displayInfo());
    console.log("\nUpdated name now reflected in this student's bookings:");
    displayBookingHistory(student, bookings);
  } catch (error) {
    console.log(`\nUpdate failed: ${error.message}`);
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
    console.log("5. View a student's booking history");
    console.log("6. Update student details");
    console.log("7. Exit");

    const choice = (await rl.question("Choose an option (1-7): ")).trim();

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
        await viewBookingHistory();
        break;
      case "6":
        await updateStudentDetails();
        break;
      case "7":
        running = false;
        break;
      default:
        console.log("\nInvalid option. Please choose 1-7.");
    }
  }

  console.log("\nThank you for using DWU Dining Meal Booking. Goodbye!");
  rl.close();
}

mainMenu().catch((error) => {
  console.log(`\nAn unexpected error occurred: ${error.message}`);
  rl.close();
});
