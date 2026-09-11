/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date: 11 September 2026
  Description: Separate test/demonstration file (optional submission file
  referenced in the assignment brief). Run this on its own with
  `node Lab3Tests.js` to see the Credit Dining Account demonstration, the
  polymorphism demonstration across all three account types, and the 8
  required tests with pass/fail results. Kept separate from DiningApp.js
  so the main application's console output matches the assignment brief
  exactly.
*/

const Student = require("./Student");
const MealBooking = require("./MealBooking");
const DiningAccount = require("./DiningAccount");
const RewardsDiningAccount = require("./RewardsDiningAccount");
const CreditDiningAccount = require("./CreditDiningAccount");

console.log("----- Credit Dining Account -----");
const credit = new CreditDiningAccount("CA001", 1000, 500);
const creditPay1 = credit.payForMeal(1500, "Catering payment");
console.log("Opening Balance: K1000.00 | Credit Limit: K500.00 | Payment Attempt: K1500.00");
console.log(`Payment Status: ${creditPay1 ? "Successful" : "Rejected"}`);
console.log(`Resulting Balance: K${credit.getBalance().toFixed(2)}`);
const creditPay2 = credit.payForMeal(50, "Extra payment");
console.log(`Second Payment Attempt: K50.00 -> ${creditPay2 ? "Successful" : "Rejected (exceeds credit limit)"}`);

console.log("\n----- Polymorphism: Same Method, Different Behaviour -----");
const standard = new DiningAccount("DA001", 1300);
const rewards = new RewardsDiningAccount("RA001", 2050, 2.5);
const demoAccounts = [standard, rewards, credit];
for (const account of demoAccounts) {
  console.log("");
  console.log(account.displayAccountSummary());
}

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
console.log("==========================================");
