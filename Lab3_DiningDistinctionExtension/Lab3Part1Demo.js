/*
  Program: Dining Meal Booking Feature — Lab 3 Distinction Extension
  Student Name: Vincent MALA
  Student ID: 220541
  Date 09 September 2026
  Description: Standalone demonstration script for Lab 3 Part 1.
  Runs the two required demonstrations from the assignment brief:
  a standard DiningAccount payment scenario and a RewardsDiningAccount
  reward calculation scenario. This script will be folded into
  DiningApp.js as part of Part 2's full integration.
*/

const DiningAccount = require("./DiningAccount");
const RewardsDiningAccount = require("./RewardsDiningAccount");

console.log("==========================================");
console.log("        STANDARD DINING ACCOUNT");
console.log("==========================================");

const standard = new DiningAccount("DA001", 1000);
console.log(`Account Number: ${standard.accountNumber}`);
console.log(`Opening Balance: K${standard.getBalance().toFixed(2)}`);

standard.deposit(500, "Top up");
console.log("Deposit: K500.00");

const paymentSucceeded = standard.payForMeal(200, "Meal payment");
console.log("Meal Payment: K200.00");
console.log(`Payment Status: ${paymentSucceeded ? "Successful" : "Rejected - Insufficient Funds"}`);
console.log(`Final Balance: K${standard.getBalance().toFixed(2)}`);

console.log("\n==========================================");
console.log("        REWARDS DINING ACCOUNT");
console.log("==========================================");

const rewards = new RewardsDiningAccount("RA001", 1500, 2.5);
console.log(`Account Number: ${rewards.accountNumber}`);
console.log(`Balance Before Reward: K${rewards.getBalance().toFixed(2)}`);
console.log(`Reward Rate: ${rewards.rewardRate}%`);

rewards.deposit(500, "Top up");
console.log("Deposit: K500.00");

const rewardEarned = rewards.calculateReward();
console.log(`Reward Earned: K${rewardEarned.toFixed(2)}`);

rewards.applyReward();
console.log(`Final Balance: K${rewards.getBalance().toFixed(2)}`);
console.log("==========================================");
