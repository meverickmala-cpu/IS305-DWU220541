/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 09 September 2026
  Description: A Node.js console application that uses the Student,
  MealBooking, DiningAccount, RewardsDiningAccount and CreditDiningAccount
  classes together to create, validate, confirm, cancel, pay for and
  display DWU student dining bookings. A Student object stores identity
  once and can be connected to one dining account (of any subtype);
  MealBooking objects hold a reference to that Student and route payment
  through processPayment(), which is polymorphic — it always calls
  payForMeal() and never checks which account subtype it is dealing with.
  All bookings, students and accounts are stored in JavaScript arrays in
  memory; no database or file storage is used.
*/

const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const Student = require("./Student");
const MealBooking = require("./MealBooking");
const DiningAccount = require("./DiningAccount");
const RewardsDiningAccount = require("./RewardsDiningAccount");
const CreditDiningAccount = require("./CreditDiningAccount");

const rl = readline.createInterface({ input, output });
const bookings = []; // Stores all created MealBooking objects
const students = []; // Stores all created Student objects (one per student ID)
const diningAccounts = []; // Stores every dining account created (any subtype)

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

// Creates a new dining account of the chosen subtype and assigns it to
// an existing student via Student.assignDiningAccount(). A student can
// only hold one dining account at a time, matching the assignment brief.
async function assignDiningAccountMenu() {
  const studentId = (await rl.question("\nEnter Student ID: ")).trim();
  const student = findStudent(studentId);

  if (!student) {
    console.log("\nNo student found with that ID.");
    return;
  }

  console.log("\nAccount types: 1) Standard  2) Rewards  3) Credit");
  const typeChoice = (await rl.question("Choose account type (1-3): ")).trim();
  const accountNumber = (await rl.question("New account number: ")).trim();
  const openingBalanceInput = (await rl.question("Opening balance (leave blank for 0): ")).trim();
  const openingBalance = openingBalanceInput === "" ? 0 : parseFloat(openingBalanceInput);

  try {
    let account;

    if (typeChoice === "2") {
      const rateInput = (await rl.question("Reward rate % (e.g. 2.5): ")).trim();
      account = new RewardsDiningAccount(accountNumber, openingBalance, parseFloat(rateInput));
    } else if (typeChoice === "3") {
      const limitInput = (await rl.question("Credit limit (e.g. 500): ")).trim();
      account = new CreditDiningAccount(accountNumber, openingBalance, parseFloat(limitInput));
    } else {
      account = new DiningAccount(accountNumber, openingBalance);
    }

    student.assignDiningAccount(account);
    diningAccounts.push(account);

    console.log("\nDining account created and assigned.");
    console.log(account.displayAccountSummary());
  } catch (error) {
    console.log(`\nCould not create account: ${error.message}`);
  }
}

// Finds a booking the same way updateBookingStatus() does, then routes
// payment through the student's assigned dining account. MealBooking
// decides success/failure by calling payForMeal() on whatever account
// subtype is connected — this function never checks the subtype itself.
async function payForBookingMenu() {
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

  const student = findStudent(studentId);
  if (!student || !student.diningAccount) {
    console.log("\nThis student has no dining account assigned yet. Use option 7 first.");
    return;
  }

  const result = booking.processPayment(student.diningAccount);
  console.log(`\n${result.message}`);
  console.log(booking.getSummary());
  console.log(student.diningAccount.displayAccountSummary());
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
    console.log("7. Assign a dining account to a student");
    console.log("8. Pay for a booking");
    console.log("9. Exit");

    const choice = (await rl.question("Choose an option (1-9): ")).trim();

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
        await assignDiningAccountMenu();
        break;
      case "8":
        await payForBookingMenu();
        break;
      case "9":
        running = false;
        break;
      default:
        console.log("\nInvalid option. Please choose 1-9.");
    }
  }

  console.log("\nThank you for using DWU Dining Meal Booking. Goodbye!");
  rl.close();
}

// ==========================================================
// LAB 3 REQUIRED DEMONSTRATIONS AND TESTS
// Runs automatically before the interactive menu so every required
// scenario in the assignment brief is visible without needing manual
// input. Uses its own local objects — it does not touch the
// students/bookings/diningAccounts arrays used by the interactive menu.
// ==========================================================
function runLab3Demonstrations() {
  console.log("==========================================");
  console.log("   LAB 3 — REQUIRED DEMONSTRATIONS & TESTS");
  console.log("==========================================");

  // ---------- Part 1: Standard DiningAccount demonstration ----------
  console.log("\n----- Standard Dining Account -----");
  const standard = new DiningAccount("DA001", 1000);
  standard.deposit(500, "Top up");
  const standardPay = standard.payForMeal(200, "Meal payment");
  console.log(`Opening Balance: K1000.00 | Deposit: K500.00 | Meal Payment: K200.00`);
  console.log(`Payment Status: ${standardPay ? "Successful" : "Rejected"}`);
  console.log(`Final Balance: K${standard.getBalance().toFixed(2)}`);

  // ---------- Part 1: RewardsDiningAccount demonstration ----------
  console.log("\n----- Rewards Dining Account -----");
  const rewards = new RewardsDiningAccount("RA001", 1500, 2.5);
  rewards.deposit(500, "Top up");
  const rewardEarned = rewards.calculateReward();
  rewards.applyReward();
  console.log(`Balance Before Reward: K1500.00 | Reward Rate: 2.5% | Deposit: K500.00`);
  console.log(`Reward Earned: K${rewardEarned.toFixed(2)}`);
  console.log(`Final Balance: K${rewards.getBalance().toFixed(2)}`);

  // ---------- Part 2: CreditDiningAccount demonstration ----------
  console.log("\n----- Credit Dining Account -----");
  const credit = new CreditDiningAccount("CA001", 1000, 500);
  const creditPay1 = credit.payForMeal(1500, "Catering payment");
  console.log(`Opening Balance: K1000.00 | Credit Limit: K500.00 | Payment Attempt: K1500.00`);
  console.log(`Payment Status: ${creditPay1 ? "Successful" : "Rejected"}`);
  console.log(`Resulting Balance: K${credit.getBalance().toFixed(2)}`);
  const creditPay2 = credit.payForMeal(50, "Extra payment");
  console.log(`Second Payment Attempt: K50.00 -> ${creditPay2 ? "Successful" : "Rejected (exceeds credit limit)"}`);

  // ---------- Part 2: Polymorphism demonstration ----------
  console.log("\n----- Polymorphism: Same Method, Different Behaviour -----");
  const demoAccounts = [standard, rewards, credit];
  for (const account of demoAccounts) {
    console.log("");
    console.log(account.displayAccountSummary());
  }

  // ---------- Part 2: Full integration example (Student + Account + Booking) ----------
  console.log("\n----- Full Integration: Student, Dining Account, Meal Booking -----");
  const maria = new Student("DWU2026001", "Maria", "Kila");
  const mariaAccount = new RewardsDiningAccount("RA002", 100, 2.5);
  maria.assignDiningAccount(mariaAccount);

  console.log("==========================================");
  console.log("        STUDENT DINING ACCOUNT");
  console.log("==========================================");
  console.log(`Student: ${maria.getFullName()}`);
  console.log(`Student ID: ${maria.studentId}`);
  console.log(`Account Type: ${mariaAccount.getAccountType()}`);
  console.log(`Account Number: ${mariaAccount.accountNumber}`);
  console.log(`Opening Balance: K${mariaAccount.getBalance().toFixed(2)}`);

  const dinnerBooking = new MealBooking({
    student: maria,
    mealDate: "2026-09-10",
    mealType: "Dinner",
    quantity: 2,
    dietaryNote: "",
  });
  dinnerBooking.validate();

  const paymentResult = dinnerBooking.processPayment(mariaAccount);

  console.log("\n==========================================");
  console.log("              MEAL BOOKING");
  console.log("==========================================");
  console.log(`Meal: ${dinnerBooking.mealType}`);
  console.log(`Quantity: ${dinnerBooking.quantity}`);
  console.log(`Total Cost: K${dinnerBooking.calculateTotal().toFixed(2)}`);
  console.log(`Payment Status: ${paymentResult.success ? "Successful" : "Rejected"}`);
  console.log(`Booking Status: ${dinnerBooking.bookingStatus}`);
  console.log(`Remaining Balance: K${mariaAccount.getBalance().toFixed(2)}`);

  console.log("\n" + mariaAccount.displayTransactionHistory());

  // Duplicate payment attempt — must be blocked.
  const duplicateAttempt = dinnerBooking.processPayment(mariaAccount);
  console.log(`\nDuplicate payment attempt: ${duplicateAttempt.message}`);

  // ---------- Required Tests ----------
  console.log("\n==========================================");
  console.log("              REQUIRED TESTS");
  console.log("==========================================");

  const tests = [];

  // Test 1: Standard account payment succeeds with sufficient funds.
  const t1account = new DiningAccount("T1", 500);
  tests.push(["Standard account payment (sufficient funds)", t1account.payForMeal(200) === true]);

  // Test 2: Standard account payment rejected, balance unchanged.
  const t2account = new DiningAccount("T2", 100);
  const t2balanceBefore = t2account.getBalance();
  const t2result = t2account.payForMeal(500);
  tests.push(["Insufficient standard balance rejected", t2result === false && t2account.getBalance() === t2balanceBefore]);

  // Test 3: Rewards calculation and application correct.
  const t3account = new RewardsDiningAccount("T3", 1000, 10);
  const t3reward = t3account.calculateReward();
  t3account.applyReward();
  tests.push(["Rewards calculation and application", t3reward === 100 && t3account.getBalance() === 1100]);

  // Test 4: Credit account payment within limit succeeds.
  const t4account = new CreditDiningAccount("T4", 100, 200);
  tests.push(["Credit account payment within limit", t4account.payForMeal(250) === true]);

  // Test 5: Credit account payment exceeding limit rejected.
  const t5account = new CreditDiningAccount("T5", 100, 200);
  tests.push(["Credit limit exceeded rejected", t5account.payForMeal(999) === false]);

  // Test 6: Polymorphic dispatch — each account type reports its own label.
  const t6types = [new DiningAccount("T6a"), new RewardsDiningAccount("T6b", 0, 1), new CreditDiningAccount("T6c", 0, 1)]
    .map((a) => a.getAccountType());
  tests.push([
    "Polymorphic account processing",
    t6types[0] === "DiningAccount" && t6types[1] === "RewardsDiningAccount" && t6types[2] === "CreditDiningAccount",
  ]);

  // Test 7: Successful booking payment confirms the booking.
  const t7student = new Student("T7", "Test", "Student");
  const t7account = new DiningAccount("T7acc", 1000);
  t7student.assignDiningAccount(t7account);
  const t7booking = new MealBooking({ student: t7student, mealDate: "2026-01-01", mealType: "Lunch", quantity: 1, dietaryNote: "" });
  t7booking.processPayment(t7account);
  tests.push(["Booking payment confirms booking", t7booking.bookingStatus === "Confirmed"]);

  // Test 8: A confirmed/paid booking cannot be charged again.
  const t8result = t7booking.processPayment(t7account);
  tests.push(["Duplicate payment prevented", t8result.success === false]);

  tests.forEach(([name, passed], i) => {
    console.log(`${i + 1}. ${name}: ${passed ? "PASS" : "FAIL"}`);
  });

  const passCount = tests.filter(([, passed]) => passed).length;
  console.log(`\n${passCount}/${tests.length} tests passed.`);
  console.log("==========================================\n");
}

runLab3Demonstrations();

mainMenu().catch((error) => {
  console.log(`\nAn unexpected error occurred: ${error.message}`);
  rl.close();
});
