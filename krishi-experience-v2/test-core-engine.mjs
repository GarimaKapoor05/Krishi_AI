/**
 * Automated Verification Test Suite for Krishi AI V2 Core Engines
 * 
 * Tests:
 * 1. Date calculations and DAS (Days After Sowing)
 * 2. Crop growth-stage transitions (Wheat, Cotton, Rice, Maize)
 * 3. Task generation, completion, and rescheduling
 * 4. Mandi 7-day historical pricing and filtering
 * 5. Price forecast calculations
 * 6. Weather forecast parsing and alert generation
 */

import {
  calculateDAS,
  formatDateISO,
  getCropConfig,
  generateCropLifecycleState
} from "./src/services/cropLifecycleEngine.js";

import {
  INDIAN_MANDIS,
  generate7DayPriceHistory,
  getMandiComparisons,
  fetchPriceForecast
} from "./src/services/mandiPriceService.js";

import { fetch7DayWeather } from "./src/services/weatherService.js";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("   RUNNING KRISHI AI V2 CORE ENGINE TESTS");
  console.log("========================================================\n");

  // 1. DATE CALCULATIONS & DAS
  console.log("--- 1. Testing Date Calculations & DAS ---");
  const today = new Date();
  const todayStr = formatDateISO(today);

  assert(calculateDAS(todayStr, today) === 0, "DAS for today's sowing date should be 0");

  const twentyDaysAgo = new Date(today);
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
  const twentyDaysAgoStr = formatDateISO(twentyDaysAgo);
  assert(calculateDAS(twentyDaysAgoStr, today) === 20, "DAS for 20 days ago should be exactly 20");

  assert(calculateDAS(null, today) === 0, "DAS for null sowing date should handle gracefully (0)");
  assert(calculateDAS("invalid-date", today) === 0, "DAS for invalid date string should handle gracefully (0)");

  // 2. CROP-STAGE TRANSITIONS
  console.log("\n--- 2. Testing Crop Stage Transitions ---");
  const wheatConfig = getCropConfig("Wheat");
  assert(wheatConfig.totalDurationDays === 135, "Wheat duration should be 135 days");
  assert(wheatConfig.stages.length >= 7, "Wheat should have distinct growth stages");

  // Day 0: Sowing
  const stateDay0 = generateCropLifecycleState("Wheat", todayStr);
  assert(stateDay0.currentStage.id === "sowing_germination", "Day 0 should be in Sowing & Germination stage");

  // Day 21: Crown Root Initiation (CRI)
  const twentyOneDaysAgo = new Date(today);
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
  const stateDay21 = generateCropLifecycleState("Wheat", formatDateISO(twentyOneDaysAgo));
  assert(stateDay21.currentStage.id === "crown_root", "Day 21 should transition to Crown Root Initiation (CRI)");

  // Day 75: Booting & Heading
  const seventyFiveDaysAgo = new Date(today);
  seventyFiveDaysAgo.setDate(seventyFiveDaysAgo.getDate() - 75);
  const stateDay75 = generateCropLifecycleState("Wheat", formatDateISO(seventyFiveDaysAgo));
  assert(stateDay75.currentStage.id === "booting_heading", "Day 75 should transition to Booting & Heading stage");

  // Unlisted crop fallback
  const genericState = generateCropLifecycleState("Dragonfruit", todayStr);
  assert(genericState.cropName === "Dragonfruit", "Generic crop fallback should preserve custom crop name");
  assert(genericState.stages.length > 0, "Generic crop should have default growth stages");

  // 3. TASK GENERATION, COMPLETION & RESCHEDULING
  console.log("\n--- 3. Testing Task Generation & Scheduling ---");
  assert(stateDay21.tasks.length >= 10, "Wheat should generate rich operational task schedule");
  const criTask = stateDay21.tasks.find((t) => t.category === "irrigation" && t.dayOffset === 21);
  assert(criTask !== undefined, "Should contain CRI 1st irrigation task at day offset 21");
  assert(criTask.isCritical === true, "CRI irrigation task must be marked critical");

  // Test Task Completion Persistence Simulation
  const mockTaskState = {
    [criTask.id]: { completed: true, completedAt: new Date().toISOString(), notes: "Irrigated 60mm with borewell" }
  };
  const stateWithCompleted = generateCropLifecycleState("Wheat", formatDateISO(twentyOneDaysAgo), mockTaskState);
  const updatedTask = stateWithCompleted.tasks.find((t) => t.id === criTask.id);
  assert(updatedTask.status === "completed", "Task state should reflect completed status");
  assert(updatedTask.notes.includes("borewell"), "Task notes must be preserved");

  // Test Task Rescheduling Simulation
  const rescheduledDate = "2026-11-25";
  const mockRescheduledState = {
    [criTask.id]: { rescheduledDate, notes: "Delayed due to canal maintenance" }
  };
  const stateWithRescheduled = generateCropLifecycleState("Wheat", formatDateISO(twentyOneDaysAgo), mockRescheduledState);
  const reschedTask = stateWithRescheduled.tasks.find((t) => t.id === criTask.id);
  assert(reschedTask.scheduledDate === rescheduledDate, "Task scheduled date must update to rescheduled date");
  assert(reschedTask.status === "rescheduled", "Task status must indicate rescheduled");

  // 4. MANDI PRICE INTELLIGENCE & FILTERING
  console.log("\n--- 4. Testing Mandi Price Intelligence ---");
  const wheatMandi = generate7DayPriceHistory("Wheat", "punjab_khanna");
  assert(wheatMandi.history.length === 7, "Mandi history must have exactly 7 daily records");
  assert(wheatMandi.latestModalPrice > 2000, "Wheat modal price should be realistic (above ₹2,000/Qtl)");
  assert(wheatMandi.history[0].modalPrice !== undefined, "History rows must have modal price");
  assert(wheatMandi.history[0].minPrice <= wheatMandi.history[0].maxPrice, "Min price must be <= Max price");

  // Test Multi-Mandi Comparisons
  const comparisons = getMandiComparisons("Wheat", "Punjab");
  assert(comparisons.length >= 3, "Should return multiple mandis for Punjab state comparison");
  assert(comparisons.every((c) => c.state === "Punjab"), "Comparison must filter by requested state");

  // Cotton price check
  const cottonMandi = generate7DayPriceHistory("Cotton", "maha_akola");
  assert(cottonMandi.latestModalPrice > 6000, "Cotton modal price should reflect cotton price tier (>₹6,000/Qtl)");

  // 5. PRICE FORECAST LOGIC
  console.log("\n--- 5. Testing Price Forecast Algorithm ---");
  const forecast = await fetchPriceForecast("Wheat", [2300, 2320, 2340, 2350, 2370, 2390, 2410]);
  assert(forecast.status === "success", "Forecast must return success status");
  assert(forecast.forecasted_price > 0, "Forecasted price must be positive number");
  assert(typeof forecast.percentage_change === "number", "Percentage change must be numeric");
  assert(["Upward", "Downward"].includes(forecast.trend), "Trend must be Upward or Downward");

  // 6. WEATHER SERVICE & ALERTS
  console.log("\n--- 6. Testing Weather Service & Agronomic Alerts ---");
  const weather = await fetch7DayWeather("Ludhiana", "Punjab");
  assert(weather.days.length === 7, "Weather service must provide 7-day forecast");
  assert(weather.days.every((d) => typeof d.maxTemp === "number"), "All days must have numeric max temperature");
  assert(weather.days.every((d) => typeof d.rainProb === "number"), "All days must have numeric rain probability");
  assert(weather.alerts !== undefined, "Weather response must include agronomic alerts array");

  console.log("\n========================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite();
