/**
 * Crop Life-Cycle Engine for Krishi AI V2
 * 
 * Provides verified agronomic growth-stage definitions, duration, and
 * dynamic schedule calculation for major Indian crops.
 * Calculates Days After Sowing (DAS), current growth stage, milestones,
 * and generates realistic farming tasks (irrigation, fertilization, weeding, protection).
 */

export const CROP_AGRONOMIC_DATABASE = {
  wheat: {
    name: "Wheat (गेहूं)",
    standardVariety: "PBW 343 / HD 2967",
    season: "Rabi",
    totalDurationDays: 135,
    stages: [
      { id: "sowing_germination", name: "Sowing & Germination", startDay: 0, endDay: 12, description: "Seed imbibition, radicle emergence and coleoptile emergence above soil." },
      { id: "crown_root", name: "Crown Root Initiation (CRI)", startDay: 13, endDay: 25, description: "Crucial stage for first irrigation. Crown roots anchor the plant and absorb nutrients." },
      { id: "tillering", name: "Tillering Stage", startDay: 26, endDay: 48, description: "Side shoots develop from the base; determine number of grain heads per unit area." },
      { id: "jointing_stem", name: "Jointing & Stem Elongation", startDay: 49, endDay: 70, description: "Nodes become distinct; rapid vegetative growth requiring balanced nutrition." },
      { id: "booting_heading", name: "Booting & Heading", startDay: 71, endDay: 88, description: "Ear head swells inside sheath and emerges; highly sensitive to moisture stress." },
      { id: "flowering_anthesis", name: "Flowering & Anthesis", startDay: 89, endDay: 102, description: "Pollen shed and fertilization of florets; determine grain count." },
      { id: "grain_filling", name: "Milking & Grain Filling", startDay: 103, endDay: 120, description: "Nutrients transfer into kernel; starch accumulation determines test weight." },
      { id: "ripening_harvest", name: "Ripening & Harvest", startDay: 121, endDay: 135, description: "Moisture drops below 14%; crop turns golden yellow, ready for harvesting." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Land Prep & Seed Treatment", category: "nutrient", isCritical: true, description: "Treat seeds with Trichoderma / Carbendazim (2g/kg) and Azotobacter culture before sowing. Apply basal NPK.", reason: "Protects against soil-borne fungal pathogens and establishes early symbiotic nitrogen fixation." },
      { dayOffset: 5, title: "Initial Emergence Check", category: "scouting", isCritical: false, description: "Inspect field for uniform seedling emergence across rows.", reason: "Identifies patchiness or bird damage early for gap filling." },
      { dayOffset: 21, title: "CRI Stage 1st Irrigation", category: "irrigation", isCritical: true, description: "Apply light irrigation (50-60 mm). Crown Root Initiation is the single most critical irrigation window for wheat.", reason: "Yield loss up to 35% can occur if water is deficient at the CRI stage." },
      { dayOffset: 25, title: "First Split Nitrogen (Urea) Top Dressing", category: "nutrient", isCritical: true, description: "Broadcast 1/3rd dose of Urea (approx 45 kg/acre) immediately following first irrigation when soil is moist.", reason: "Promotes vigorous tillering and photosynthetic leaf area." },
      { dayOffset: 32, title: "Broadleaf & Grassy Weed Management", category: "weeding", isCritical: false, description: "Spray Sulfosulfuron + Metsulfuron-methyl or Clodinafop-propargyl in moist soil.", reason: "Prevents Phalaris minor and broadleaf weeds from competing for sunlight and nutrients." },
      { dayOffset: 42, title: "2nd Irrigation (Late Tillering)", category: "irrigation", isCritical: false, description: "Apply second irrigation to sustain tiller survival and root proliferation.", reason: "Maintains optimal soil moisture to prevent tiller mortality." },
      { dayOffset: 55, title: "Stem Elongation Soil Moisture & Nutrient Check", category: "scouting", isCritical: false, description: "Check lower leaves for Nitrogen deficiency yellowing. Apply zinc sulfate foliar spray (0.5%) if deficiency is noted.", reason: "Ensures sturdy stems capable of supporting heavy ear heads without lodging." },
      { dayOffset: 65, title: "3rd Irrigation (Late Jointing)", category: "irrigation", isCritical: true, description: "Irrigate thoroughly before boot leaf emerges.", reason: "Moisture stress at jointing reduces spikelet count per ear." },
      { dayOffset: 75, title: "Second Split Urea Top Dressing", category: "nutrient", isCritical: false, description: "Apply remaining split of Urea prior to boot stage.", reason: "Drives flag leaf chlorophyll content and grain protein synthesis." },
      { dayOffset: 82, title: "Yellow / Brown Rust Preventive Scouting", category: "protection", isCritical: true, description: "Examine leaves for yellow pustules in linear stripes. If detected, spray Propiconazole 25% EC (1 ml/L).", reason: "Rust epidemics can reduce wheat grain yield significantly in cool humid weather." },
      { dayOffset: 92, title: "4th Irrigation (Flowering Stage)", category: "irrigation", isCritical: true, description: "Ensure adequate root zone moisture during anthesis. Avoid flood irrigation during high winds to prevent lodging.", reason: "Water deficit at flowering causes floret abortion and reduces grain setting." },
      { dayOffset: 105, title: "5th Irrigation (Milk Stage)", category: "irrigation", isCritical: true, description: "Apply gentle irrigation during kernel milk formation.", reason: "Directly increases thousand-grain weight and plumpness." },
      { dayOffset: 115, title: "6th Irrigation (Dough Stage - Terminal)", category: "irrigation", isCritical: false, description: "Final light irrigation for late sown crops. Stop all watering 12-14 days before expected harvest.", reason: "Permits complete starch hardening and uniform field drying." },
      { dayOffset: 128, title: "Pre-Harvest Grain Moisture Inspection", category: "harvest", isCritical: false, description: "Collect sample grains; test hardness with teeth. Moisture should be 12-14% for safe storage.", reason: "Harvesting too wet causes fungal spoilage; harvesting too dry causes shatter loss." },
      { dayOffset: 135, title: "Combine Harvesting & Straw Management", category: "harvest", isCritical: true, description: "Harvest using combine harvester on sunny day. Manage crop residue with Happy Seeder or mulching.", reason: "Prevents stubble burning, preserves soil organic carbon, and completes the crop cycle." }
    ]
  },

  rice: {
    name: "Rice / Paddy (धान)",
    standardVariety: "Pusa Basmati 1509 / PR 126",
    season: "Kharif",
    totalDurationDays: 125,
    stages: [
      { id: "nursery_seedling", name: "Nursery & Seedling", startDay: 0, endDay: 22, description: "Raising healthy seedlings in wet nursery bed; pre-treatment of seeds." },
      { id: "transplanting_rooting", name: "Transplanting & Establishment", startDay: 23, endDay: 35, description: "Transplanting 2-3 seedlings per hill into puddled field with shallow standing water." },
      { id: "active_tillering", name: "Active Tillering", startDay: 36, endDay: 58, description: "Rapid tiller emergence; peak demand for nitrogen and continuous shallow water layer." },
      { id: "panicle_initiation", name: "Panicle Initiation (PI)", startDay: 59, endDay: 75, description: "Microscopic panicle branches develop inside stem; determines yield potential." },
      { id: "flowering_heading", name: "Heading & Flowering", startDay: 76, endDay: 92, description: "Panicles exert fully from boot; anthesis occurs within morning hours." },
      { id: "grain_dough", name: "Milk to Dough Stage", startDay: 93, endDay: 110, description: "Grain fills with liquid endosperm transitioning into firm starch dough." },
      { id: "ripening_harvest", name: "Maturity & Harvesting", startDay: 111, endDay: 125, description: "Grains turn golden; moisture drops to 16-18%; drain field for combine access." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Seed Soaking & Sprouting", category: "nutrient", isCritical: true, description: "Treat seeds with Carbendazim (1g/kg) and soak for 24 hours. Incubate in moist gunny bags for sprouting.", reason: "Disinfects seed surface and triggers uniform germination." },
      { dayOffset: 23, title: "Puddling & Main Field Transplanting", category: "irrigation", isCritical: true, description: "Puddle field twice, level properly, and transplant 20-25 day old seedlings at 20x15 cm spacing. Maintain 2-3 cm water.", reason: "Puddling reduces percolation water loss; optimal spacing maximizes productive tillers." },
      { dayOffset: 30, title: "Basal Fertilizer Application & Zinc Booster", category: "nutrient", isCritical: true, description: "Broadcast DAP, MOP, and Zinc Sulfate (25 kg/ha). Zinc is essential for khaira disease prevention.", reason: "Promotes early root anchoring and prevents zinc deficiency chlorosis." },
      { dayOffset: 42, title: "First Nitrogen Top Dressing & Cono-Weeding", category: "nutrient", isCritical: false, description: "Apply Urea (1/3rd split) and operate cono-weeder or apply Pretilachlor herbicide.", reason: "Aerates root zone and eliminates grassy weed competition." },
      { dayOffset: 52, title: "Stem Borer & Leaf Folder Field Monitoring", category: "protection", isCritical: true, description: "Scout for dead hearts or folded leaves. Install pheromone traps (5/acre) or spray Chlorantraniliprole 18.5% SC.", reason: "Yellow stem borer attacks can cause severe white ears and vegetative dead hearts." },
      { dayOffset: 65, title: "Panicle Initiation (PI) Water & Nitrogen Boost", category: "irrigation", isCritical: true, description: "Ensure constant 4-5 cm water depth. Apply final split of Urea + MOP.", reason: "Moisture or nutrient stress at PI directly curtails grain count per panicle." },
      { dayOffset: 78, title: "Sheath Blight & Blast Preventative Spray", category: "protection", isCritical: false, description: "Check lower leaf sheaths for oval lesions with brown margins. Spray Hexaconazole (2 ml/L) if observed.", reason: "Prevents sheath blight from climbing up to flag leaves." },
      { dayOffset: 95, title: "Maintain Moist Soil During Milking", category: "irrigation", isCritical: true, description: "Keep field wet by alternate wetting and drying; avoid standing deep water.", reason: "Conserves water while preventing chalky or unfilled grains." },
      { dayOffset: 112, title: "Terminal Field Drainage", category: "irrigation", isCritical: true, description: "Drain all standing water 10-12 days before scheduled harvest date.", reason: "Hardens the soil for mechanical harvester machinery and accelerates uniform grain ripening." },
      { dayOffset: 125, title: "Combine Harvesting & Sun Drying", category: "harvest", isCritical: true, description: "Harvest when 85% of grains on panicles turn straw-yellow. Dry grains to 14% moisture before bagging.", reason: "Prevents head rice breakage during milling and grain mold in storage." }
    ]
  },

  cotton: {
    name: "Cotton (कपास)",
    standardVariety: "Bt Cotton Hybrid (RCH 659 / Bollgard II)",
    season: "Kharif",
    totalDurationDays: 165,
    stages: [
      { id: "germination_seedling", name: "Germination & Seedling", startDay: 0, endDay: 20, description: "Emergence of cotyledons followed by first true leaves; thin out excess plants." },
      { id: "square_formation", name: "Squaring (Floral Budding)", startDay: 21, endDay: 50, description: "Pyramidal floral buds (squares) appear; early sucking pest monitoring is vital." },
      { id: "flowering_boll_dev", name: "Peak Flowering & Boll Development", startDay: 51, endDay: 105, description: "White flowers open, turn pink upon pollination; young bolls expand rapidly." },
      { id: "boll_maturation", name: "Boll Maturation & Fiber Filling", startDay: 106, endDay: 135, description: "Cellulose deposition inside boll fibers; high potassium requirement." },
      { id: "bursting_harvest", name: "Boll Bursting & Pickings", startDay: 136, endDay: 165, description: "Bolls burst open revealing fluffy white lint; multi-stage manual pickings." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Ridge & Furrow Sowing", category: "nutrient", isCritical: true, description: "Sow Bt cotton on ridges at 90x60 cm. Apply basal DAP and neem cake.", reason: "Ridge planting prevents waterlogging during heavy monsoon downpours." },
      { dayOffset: 15, title: "Thinning & Gap Filling", category: "scouting", isCritical: false, description: "Leave one vigorous seedling per hill; fill any gaps with polybag raised seedlings.", reason: "Guarantees optimal plant population density." },
      { dayOffset: 30, title: "Sucking Pest Surveillance (Jassids & Thrips)", category: "protection", isCritical: true, description: "Inspect underside of top leaves for leaf curl and hopper burn. Spray Flonicamid 50 WG if threshold exceeded.", reason: "Uncontrolled sucking pests stunt young cotton plants and deform squares." },
      { dayOffset: 45, title: "First Top Dressing of Urea & Earthing Up", category: "nutrient", isCritical: false, description: "Apply Urea around plants and earth-up soil around stems to support the plant frame.", reason: "Strengthens root anchorage against wind lodging." },
      { dayOffset: 65, title: "Pink Bollworm Pheromone Trap Installation", category: "protection", isCritical: true, description: "Install 4 pheromone traps per acre with Gossyplure septa. Monitor trap catches weekly.", reason: "Pink bollworm larvae enter bolls and destroy lint quality without external exit holes." },
      { dayOffset: 85, title: "Foliar Potassium Nitrate (13:0:45) Spray", category: "nutrient", isCritical: true, description: "Spray 1% KNO3 (10g/L) during peak boll swelling stage.", reason: "Enhances boll retention and improves fiber micronaire and staple length." },
      { dayOffset: 110, title: "Smart Drip Irrigation in Dry Spells", category: "irrigation", isCritical: false, description: "Deliver 3-4 hours of drip irrigation if monsoon rains recede.", reason: "Moisture stress causes extensive boll shedding." },
      { dayOffset: 140, title: "First Picking of Clean Fluffy Cotton", category: "harvest", isCritical: true, description: "Pick fully opened bolls in bright afternoon sunshine. Keep free from dried bracts and leaf trash.", reason: "Secures top Grade-A modal prices in APMC mandis." },
      { dayOffset: 160, title: "Second Picking & Field Clean Up", category: "harvest", isCritical: false, description: "Complete second picking; collect remaining bolls and prepare field for rabi rotation.", reason: "Reduces overwintering pink bollworm pupae in soil." }
    ]
  },

  maize: {
    name: "Maize / Corn (मक्का)",
    standardVariety: "Pioneer 3396 / DKC 9108",
    season: "Kharif / Rabi",
    totalDurationDays: 105,
    stages: [
      { id: "emergence_seedling", name: "Emergence & Seedling (V1-V4)", startDay: 0, endDay: 18, description: "Vegetative leaf development; collar formation on young leaves." },
      { id: "knee_high", name: "Knee High (V6-V8)", startDay: 19, endDay: 38, description: "Rapid elongation; ear shoots initiate within node joints." },
      { id: "tasseling_silking", name: "Tasseling (VT) & Silking (R1)", startDay: 39, endDay: 62, description: "Tassel sheds pollen onto moist ear silks; most moisture critical period." },
      { id: "grain_filling", name: "Blister & Dough Stage (R2-R4)", startDay: 63, endDay: 85, description: "Kernels fill with starch; embryo develops inside corn grain." },
      { id: "black_layer_harvest", name: "Physiological Maturity (R6)", startDay: 86, endDay: 105, description: "Black layer forms at kernel tip; harvest ready when husk turns dry tan." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Bed Preparation & Seed Treatment", category: "nutrient", isCritical: true, description: "Treat seeds with Thiamethoxam + Fungicide. Apply basal NPK + Zinc.", reason: "Protects against early seedling blight and wireworms." },
      { dayOffset: 15, title: "Fall Armyworm (FAW) Whorl Scouting", category: "protection", isCritical: true, description: "Check central leaf whorls for pinholes and fresh frass. Apply sand+lime mix or Emamectin Benzoate if present.", reason: "FAW can defoliate entire maize fields within 72 hours if unchecked." },
      { dayOffset: 30, title: "Knee-High Stage Irrigation & Nitrogen Top Dressing", category: "nutrient", isCritical: true, description: "Apply Urea (50 kg/acre) along crop rows followed by light irrigation.", reason: "Fuels structural stem growth and ear size determination." },
      { dayOffset: 48, title: "Tasseling Stage Irrigation (Critical)", category: "irrigation", isCritical: true, description: "Ensure root zone has zero water stress during pollen shedding and silking.", reason: "Moisture stress at silking delays silk emergence, leading to barren cobs." },
      { dayOffset: 70, title: "Grain Filling Irrigation", category: "irrigation", isCritical: false, description: "Maintain soil moisture to maximize kernel weight.", reason: "Prevents tip abortion on ears." },
      { dayOffset: 100, title: "Harvesting & Shelling Inspection", category: "harvest", isCritical: true, description: "Harvest cobs when black layer appears at grain base and kernel moisture is under 18%.", reason: "Prevents aflatoxin mold development." }
    ]
  },

  mustard: {
    name: "Mustard / Rapeseed (सरसों)",
    standardVariety: "Pusa Bold / Giriraj (DRMRIJ 31)",
    season: "Rabi",
    totalDurationDays: 120,
    stages: [
      { id: "germination_rosette", name: "Germination & Rosette", startDay: 0, endDay: 28, description: "Slow initial ground hugging rosette of leaves with taproot penetration." },
      { id: "stem_branching", name: "Stem Elongation & Branching", startDay: 29, endDay: 55, description: "Primary and secondary branches proliferate with flower buds." },
      { id: "flowering", name: "Peak Flowering", startDay: 56, endDay: 80, description: "Vibrant yellow canopy; bee pollination substantially boosts seed set." },
      { id: "pod_siliqua", name: "Siliqua (Pod) Formation", startDay: 81, endDay: 105, description: "Long pods swell with oily seeds; aphid surveillance is paramount." },
      { id: "maturity_harvest", name: "Pod Maturity & Harvest", startDay: 106, endDay: 120, description: "Pods turn parchment yellow; harvest in morning to minimize shattering." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Sowing & Sulfur Fertilization", category: "nutrient", isCritical: true, description: "Sow seeds at 4-5 cm depth. Apply elemental sulfur or gypsum (200 kg/ha).", reason: "Sulfur is essential for oil synthesis and protein quality in brassica crops." },
      { dayOffset: 25, title: "First Irrigation & Thinning", category: "irrigation", isCritical: true, description: "Maintain 15 cm plant-to-plant spacing. Irrigate at 25-28 DAS.", reason: "Avoids overcrowding and establishes strong taproot system." },
      { dayOffset: 45, title: "Mustard Aphid (Lipaphis erysimi) Inspection", category: "protection", isCritical: true, description: "Check inflorescence tips for green aphid clusters. Spray Dimethoate or Thiamethoxam if >20 aphids/plant.", reason: "Aphids suck sap from tender shoots, severely cutting seed and oil yield." },
      { dayOffset: 65, title: "Second Irrigation (Pod Initiation)", category: "irrigation", isCritical: false, description: "Irrigate gently during early siliqua formation.", reason: "Supports seed count per pod." },
      { dayOffset: 115, title: "Morning Harvest to Avoid Shattering", category: "harvest", isCritical: true, description: "Harvest with sickles before 10 AM while dew is present.", reason: "Dry midday harvesting causes fragile siliquae to burst and shatter seeds onto ground." }
    ]
  },

  potato: {
    name: "Potato (आलू)",
    standardVariety: "Kufri Jyoti / Kufri Pukhraj",
    season: "Rabi",
    totalDurationDays: 100,
    stages: [
      { id: "sprout_emergence", name: "Sprout Emergence", startDay: 0, endDay: 18, description: "Eyes on seed tubers sprout; stems and root system establish." },
      { id: "vegetative_canopy", name: "Vegetative Canopy Growth", startDay: 19, endDay: 35, description: "Leaves and stolons develop outward." },
      { id: "tuber_initiation", name: "Tuber Initiation", startDay: 36, endDay: 50, description: "Tips of underground stolons swell into miniature tubers." },
      { id: "tuber_bulking", name: "Tuber Bulking", startDay: 51, endDay: 80, description: "Rapid accumulation of starch and water in tubers; high moisture demand." },
      { id: "maturation_curing", name: "Maturation & Skin Curing", startDay: 81, endDay: 100, description: "Dehaulming (vine cutting) done 10-12 days before digging to cure tuber skins." }
    ],
    taskTemplates: [
      { dayOffset: 0, title: "Tuber Cutting & Fungicide Dip", category: "nutrient", isCritical: true, description: "Cut certified seed tubers; treat with Mancozeb (2.5 g/L). Plant on ridges.", reason: "Prevents seed piece decay in moist soil." },
      { dayOffset: 25, title: "Earthing Up & Nitrogen Top Dressing", category: "weeding", isCritical: true, description: "Apply Urea and mound soil around stems to prevent tubers from greening upon sun exposure.", reason: "Green potatoes develop toxic solanine and become unmarketable." },
      { dayOffset: 45, title: "Late Blight (Phytophthora) Preventive Spray", category: "protection", isCritical: true, description: "Apply prophylactic spray of Mancozeb 75% WP. Watch for water-soaked leaf margins.", reason: "Late blight can decimate entire potato crops in cloudy, damp conditions." },
      { dayOffset: 60, title: "Frequent Light Sprinkler/Furrow Irrigation", category: "irrigation", isCritical: false, description: "Maintain uniform soil moisture during tuber expansion.", reason: "Irregular watering causes tuber cracking and knobby misshapen tubers." },
      { dayOffset: 85, title: "Dehaulming (Cutting Foliage Vines)", category: "harvest", isCritical: true, description: "Cut and remove aboveground foliage 12 days prior to digging out tubers.", reason: "Hardens the potato skin to resist bruising during transport and long storage." }
    ]
  }
};

/**
 * Fallback generic crop template for unlisted crops
 */
const GENERIC_CROP_TEMPLATE = {
  name: "General Agricultural Crop",
  standardVariety: "Regional Improved Variety",
  season: "Current Season",
  totalDurationDays: 120,
  stages: [
    { id: "seedling_establishment", name: "Germination & Establishment", startDay: 0, endDay: 20, description: "Initial sprout emergence, cotyledon opening, and root anchorage." },
    { id: "vegetative_growth", name: "Vegetative Canopy Growth", startDay: 21, endDay: 50, description: "Rapid biomass and foliage expansion; peak nutrient assimilation." },
    { id: "reproductive_flowering", name: "Flowering & Fruit/Seed Set", startDay: 51, endDay: 85, description: "Bloom formation and pollination; sensitive to moisture stress." },
    { id: "grain_fruit_maturity", name: "Maturation & Ripening", startDay: 86, endDay: 120, description: "Grain/fruit ripening, dry matter accumulation, and harvest readiness." }
  ],
  taskTemplates: [
    { dayOffset: 0, title: "Land Preparation & Basal Fertilization", category: "nutrient", isCritical: true, description: "Plow field, incorporate compost/FYM, and apply recommended basal NPK.", reason: "Ensures soil tilth and immediate seedling nutrition." },
    { dayOffset: 15, title: "Early Weeding & Thinning", category: "weeding", isCritical: false, description: "Remove weeds competing with young sprouts; maintain recommended row spacing.", reason: "Reduces competition for moisture and sunlight." },
    { dayOffset: 30, title: "Vegetative Irrigation & Nitrogen Boost", category: "irrigation", isCritical: true, description: "Irrigate according to soil moisture; apply first split top dressing.", reason: "Sustains vigorous vegetative canopy development." },
    { dayOffset: 55, title: "Preventive Pest & Disease Scouting", category: "protection", isCritical: true, description: "Inspect foliage and stems for symptoms; spray neem oil or bio-pesticide if needed.", reason: "Controls pest populations before economic threshold is breached." },
    { dayOffset: 70, title: "Reproductive Stage Water Management", category: "irrigation", isCritical: true, description: "Ensure adequate moisture during flowering and seed set.", reason: "Prevents flower drop and promotes healthy fruit/pod set." },
    { dayOffset: 110, title: "Pre-Harvest Field Inspection & Drainage", category: "harvest", isCritical: false, description: "Check maturity indices; withhold irrigation ahead of harvest.", reason: "Ensures uniform harvest readiness." }
  ]
};

/**
 * Get agronomic crop configuration (case-insensitive lookup with generic fallback)
 */
export function getCropConfig(cropName) {
  if (!cropName) return GENERIC_CROP_TEMPLATE;
  const cleanKey = cropName.toLowerCase().trim();
  
  // Direct match
  if (CROP_AGRONOMIC_DATABASE[cleanKey]) {
    return CROP_AGRONOMIC_DATABASE[cleanKey];
  }
  
  // Substring match (e.g. "Basmati Rice" matches "rice", "Durum Wheat" matches "wheat")
  for (const [key, data] of Object.entries(CROP_AGRONOMIC_DATABASE)) {
    if (cleanKey.includes(key) || data.name.toLowerCase().includes(cleanKey)) {
      return data;
    }
  }

  // Fallback with personalized title
  return {
    ...GENERIC_CROP_TEMPLATE,
    name: cropName
  };
}

/**
 * Calculate Days After Sowing (DAS)
 */
export function calculateDAS(sowingDateStr, referenceDate = new Date()) {
  if (!sowingDateStr) return 0;
  const sowing = new Date(sowingDateStr);
  if (isNaN(sowing.getTime())) return 0;

  const ref = new Date(referenceDate);
  if (isNaN(ref.getTime())) return 0;

  // Normalize to calendar midnight to prevent timezone hour drift
  const d1 = new Date(sowing.getFullYear(), sowing.getMonth(), sowing.getDate());
  const d2 = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date) {
  const d = new Date(date);
  const month = "" + (d.getMonth() + 1);
  const day = "" + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-");
}

/**
 * Generate full crop life-cycle state, stages, and concrete task list
 */
export function generateCropLifecycleState(cropName, sowingDateStr, storedTaskState = {}) {
  const config = getCropConfig(cropName);
  const sowingDate = sowingDateStr ? new Date(sowingDateStr) : new Date();
  const das = calculateDAS(sowingDateStr);
  const totalDays = config.totalDurationDays;

  // 1. Identify current stage
  let currentStage = config.stages[0];
  let stageProgress = 0;

  for (let i = 0; i < config.stages.length; i++) {
    const st = config.stages[i];
    if (das >= st.startDay && das <= st.endDay) {
      currentStage = st;
      const stageSpan = st.endDay - st.startDay;
      const daysIntoStage = das - st.startDay;
      stageProgress = stageSpan > 0 ? Math.round((daysIntoStage / stageSpan) * 100) : 100;
      break;
    } else if (das > st.endDay && i === config.stages.length - 1) {
      currentStage = st;
      stageProgress = 100;
    }
  }

  const overallProgress = Math.min(100, Math.round((das / totalDays) * 100));

  // 2. Estimated harvest window
  const harvestStartDate = new Date(sowingDate);
  harvestStartDate.setDate(harvestStartDate.getDate() + (config.stages[config.stages.length - 1].startDay));
  
  const harvestEndDate = new Date(sowingDate);
  harvestEndDate.setDate(harvestEndDate.getDate() + totalDays);

  // 3. Concrete tasks calculation with scheduled dates
  const tasks = config.taskTemplates.map((template, idx) => {
    const taskDate = new Date(sowingDate);
    taskDate.setDate(taskDate.getDate() + template.dayOffset);
    const dateStr = formatDateISO(taskDate);

    const taskId = `${cropName?.toLowerCase() || "crop"}_task_${idx}_${template.dayOffset}`;
    const saved = storedTaskState[taskId] || {};

    const isOverdue = !saved.completed && das > template.dayOffset + 2;

    let computedStatus = "pending";
    if (saved.completed) {
      computedStatus = "completed";
    } else if (saved.rescheduledDate) {
      computedStatus = "rescheduled";
    } else if (isOverdue) {
      computedStatus = "overdue";
    }

    return {
      id: taskId,
      title: template.title,
      category: template.category,
      isCritical: template.isCritical,
      description: template.description,
      reason: template.reason,
      dayOffset: template.dayOffset,
      scheduledDate: saved.rescheduledDate || dateStr,
      originalDate: dateStr,
      status: computedStatus,
      completedAt: saved.completedAt || null,
      notes: saved.notes || "",
      stageName: config.stages.find((s) => template.dayOffset >= s.startDay && template.dayOffset <= s.endDay)?.name || "General"
    };
  });

  return {
    cropName: config.name,
    standardVariety: config.standardVariety,
    season: config.season,
    sowingDate: formatDateISO(sowingDate),
    das,
    totalDurationDays: totalDays,
    stages: config.stages.map((st) => ({
      ...st,
      isCompleted: das > st.endDay,
      isCurrent: das >= st.startDay && das <= st.endDay,
      isUpcoming: das < st.startDay
    })),
    currentStage,
    stageProgress,
    overallProgress,
    harvestWindow: {
      start: formatDateISO(harvestStartDate),
      end: formatDateISO(harvestEndDate)
    },
    tasks
  };
}
