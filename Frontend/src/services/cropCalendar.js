const CROP_CYCLES = {
  wheat: [0, 20, 45, 75, 110, 135], rice: [0, 20, 45, 75, 105, 135], paddy: [0, 20, 45, 75, 105, 135], "rice / paddy": [0, 20, 45, 75, 105, 135],
  "maize (corn)": [0, 15, 35, 55, 85, 110], maize: [0, 15, 35, 55, 85, 110], corn: [0, 15, 35, 55, 85, 110],
  cotton: [0, 20, 50, 80, 120, 160], soybean: [0, 15, 35, 55, 85, 110],
  "mustard / rapeseed": [0, 15, 35, 55, 85, 115], "mustard/rapeseed": [0, 15, 35, 55, 85, 115], rapeseed: [0, 15, 35, 55, 85, 115], mustard: [0, 15, 35, 55, 85, 115],
  potato: [0, 15, 35, 55, 80, 105], tomato: [0, 20, 40, 60, 90, 120], onion: [0, 20, 45, 70, 100, 120],
  sugarcane: [0, 30, 90, 180, 270, 330], chickpea: [0, 15, 35, 55, 80, 105],
  chili: [0, 20, 45, 70, 100, 140], chilli: [0, 20, 45, 70, 100, 140], groundnut: [0, 15, 35, 55, 80, 110], bajra: [0, 15, 30, 50, 75, 95], millet: [0, 15, 30, 50, 75, 95],
};

const STAGES = [
  { title: "Sowing / planting", text: "Record the actual sowing or transplanting date and the variety used. Follow the locally recommended planting method and spacing." },
  { title: "Check new plants", text: "Look for new shoots, missing plants, dry patches or standing water. Note any areas that need attention." },
  { title: "Check plant growth", text: "Walk through the field. Look for weeds, weak growth or unusual marks on leaves. Ask a local farm adviser before changing fertilizer." },
  { title: "Check flowers", text: "Look at flowers and leaves. Note dry soil, heat damage or insects. Do not spray unless you know what the problem is." },
  { title: "Check grain or fruit", text: "Look at how grain or fruit is growing. Check soil moisture and note any unusual spots or damage." },
  { title: "Get ready for harvest", text: "Check if the crop looks ready. Plan workers, safe storage and transport. Ask a local adviser if unsure about harvest timing." },
];

const POMEGRANATE_TASKS = [
  [-7, "Get the field ready", "Before planting, check that water can drain, healthy plants are available and water is nearby. Ask a local fruit-growing adviser about the best planting time."],
  [0, "Plant the young trees", "Write down the planting date and variety. Follow local advice for plant spacing and planting method."],
  [3, "Check newly planted trees", "Check that each young tree is standing well and the soil around it is settled. Follow local advice on first watering."],
  [14, "Check young tree growth", "Look for new leaves, leaning trees, dry soil or plants that did not survive. Note where a replacement may be needed."],
  [30, "Check weeds and mulch", "Keep weeds away from the tree. Keep mulch from touching the trunk."],
  [60, "Check tree shape", "Look for broken or damaged branches. Ask a local fruit-growing adviser before pruning."],
  [90, "Walk around the orchard", "Look at leaves, branches and any fruit for unusual marks, insects or signs of stress. Take a photo to help track changes."],
  [120, "Check soil and tree growth", "Review tree growth and water supply. Use a soil test and local advice before adding fertilizer."],
  [150, "Choose the flowering season", "Pomegranate has three possible flowering seasons. The best one depends on your area and water supply. Ask a local fruit-growing adviser."],
  [210, "Check flowers and new fruit", "If this is your chosen flowering season, look for flowers, new fruit and dry soil. Timing differs by area."],
  [270, "Check growing fruit", "Look for fruit growth, cracks, insects or dry soil. Ask a local adviser before treating a problem."],
  [330, "Plan picking and selling", "Check if fruit looks ready to pick. Plan workers, safe storage and where you will sell it. Ask a local adviser if unsure."],
  [365, "Review the orchard for next year", "Look at tree health, water supply and soil-test results. Ask a local adviser about next year's flowering season."],
];

const dayKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
const fromDayKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateAt = (start, offset) => {
  const date = new Date(start);
  date.setDate(date.getDate() + offset);
  return date;
};
const normalizeCrop = (crop = "") => crop.trim().toLocaleLowerCase().replace(/\s+/g, " ");

function createEvent(start, offset, title, description, kind = "task") {
  const date = dateAt(start, offset);
  return {
    id: `${dayKey(start)}-${offset}-${title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    date: dayKey(date),
    day: offset,
    title,
    description,
    kind,
  };
}

export function buildCropCalendar({ cropName, isCultivating, sowingDate, plannedDate, today = new Date() }) {
  if (!cropName) return { events: [], durationDays: 0, startDate: null, perennial: false, note: "" };
  const cropKey = normalizeCrop(cropName);
  const perennial = cropKey.includes("pomegranate");
  let start = fromDayKey(isCultivating ? sowingDate : plannedDate);
  if (!start) return { events: [], durationDays: 0, startDate: null, perennial, note: "Add the planting date to build the farm calendar." };

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const matureOrchard = perennial && isCultivating && start < dateAt(todayDate, -365);
  if (matureOrchard) {
    // A mature orchard has a recurring care year; do not place all its actions
    // in the distant past based on an old sapling transplant date.
    start = todayDate;
  }

  const events = [];
  let durationDays;
  let note = "These dates are reminders, not exact predictions. Weather and crop variety can change the timing. Ask a local farm adviser before treating the crop.";

  if (perennial) {
    durationDays = 365;
    const orchardTasks = matureOrchard ? [
      [0, "Check your trees", "Walk around the orchard. Look for weak growth, dry soil or damaged branches and note what you see."],
      [14, "Check new leaves and branches", "Look for unusual marks, insects or weak growth. Write down anything that has changed."],
      [90, "Check water and soil", "Check how much water is available. Review a soil test before changing fertilizer."],
      [150, "Choose the flowering season", "Pomegranate has three possible flowering seasons. The best one depends on your area and water supply. Ask a local fruit-growing adviser."],
      [210, "Check flowers and new fruit", "If this is your chosen flowering season, look for flowers, new fruit and dry soil. Timing differs by area."],
      [270, "Check growing fruit", "Look for fruit growth, cracks, insects or dry soil. Ask a local adviser before treating a problem."],
      [330, "Plan picking and selling", "Check if fruit looks ready to pick. Plan workers, safe storage and where you will sell it."],
      [365, "Review the orchard for next year", "Look at tree health, water supply and soil-test results. Ask a local adviser about next year’s flowering season."],
    ] : POMEGRANATE_TASKS;
    orchardTasks.forEach(([day, title, description]) => events.push(createEvent(start, day, title, description, "orchard")));
    for (let day = 30; day < 365; day += 30) {
      events.push(createEvent(start, day, "Monthly orchard check", "Look at soil moisture, weeds, tree growth and any signs of insects or disease. Keep a note of changes.", "routine"));
    }
    note = "Pomegranate has three possible flowering seasons. Which one is best depends on your area and water supply. These dates are reminders, not fixed predictions. Ask a local fruit-growing adviser about the right timing.";
  } else {
    const offsets = CROP_CYCLES[cropKey] || CROP_CYCLES[cropKey.replace(" / ", "/")];
    const stages = offsets || [0, 18, 40, 65, 90, 120];
    durationDays = stages.at(-1);
    if (!offsets) note = `We do not yet have a crop-specific calendar for ${cropName}. These reminders use a general 120-day crop plan. Ask a local farm adviser to confirm dates for your crop.`;
    events.push(createEvent(start, -7, "Field readiness", "Check seed / planting material, water access, drainage and field preparation. Review local sowing guidance for your crop and season.", "prep"));
    stages.forEach((offset, index) => events.push(createEvent(start, offset, STAGES[index].title, STAGES[index].text, "stage")));
    [3, 7, 14, 21].forEach((offset, index) => {
      const earlyChecks = [
        ["Check seedbed and moisture", "Check field moisture and seedbed condition after planting; use your local crop guidance for any irrigation decision."],
        ["Check emergence", "Look for emergence, crusting, waterlogging or early damage. Record patchy areas."],
        ["Inspect crop stand", "Walk the field and note gaps, uneven growth, weeds or visible damage."],
        ["First field scouting", "Check for weeds, pests and disease symptoms. Identify the issue before deciding on treatment."],
      ];
      events.push(createEvent(start, offset, ...earlyChecks[index], "routine"));
    });
    events.push(createEvent(start, 30, "Review soil and nutrition plan", "Use available soil-test results and the locally recommended crop package before applying fertilizer.", "review"));
    for (let day = 35; day < durationDays - 10; day += 14) {
      events.push(createEvent(start, day, "Field scouting", "Check moisture, weeds, pests, disease symptoms and recent weather impacts. Record observations and seek local advice before treatment.", "routine"));
    }
    events.push(createEvent(start, Math.max(1, durationDays - 10), "Prepare for harvest", "Check maturity signs for your variety and arrange labour, safe drying / storage and transport or market options.", "review"));
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const ageDays = Math.max(0, Math.floor((todayDate - fromDayKey(isCultivating ? sowingDate : plannedDate)) / 86400000));
  const currentStage = perennial
    ? (isCultivating ? "Established orchard" : "Orchard establishment")
    : ageDays === 0 && !isCultivating
      ? "Planting planned"
      : events.filter((event) => event.kind === "stage" && event.day <= ageDays).at(-1)?.title || "Before planting";
  return { events, durationDays, startDate: start, perennial, note, ageDays, currentStage };
}

export function calendarDateKey(date) {
  return dayKey(date);
}

export function parseCalendarDate(value) {
  return fromDayKey(value);
}
