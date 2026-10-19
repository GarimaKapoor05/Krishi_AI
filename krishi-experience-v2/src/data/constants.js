/**
 * Agricultural Constants & Lookups for Krishi AI V2
 * Tailored for Indian farming context and regional agro-climatic zones.
 */

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

export const SOIL_TYPES = [
  {
    id: "alluvial",
    name: "Alluvial Soil",
    description: "Rich in loam & silt, highly fertile. Found in Indo-Gangetic plains.",
    color: "#a3704c"
  },
  {
    id: "black",
    name: "Black / Regur Soil",
    description: "Deep clayey texture with high water retention. Ideal for cotton & pulses.",
    color: "#3d3a37"
  },
  {
    id: "red_yellow",
    name: "Red & Yellow Soil",
    description: "Porous, rich in iron, well-draining. Found in peninsular plateaus.",
    color: "#b95d38"
  },
  {
    id: "laterite",
    name: "Laterite Soil",
    description: "Intensively leached, iron-alumina rich. Common in coastal & hilly belts.",
    color: "#9e432a"
  },
  {
    id: "arid_sandy",
    name: "Sandy / Arid Soil",
    description: "Low moisture retention, high aeration. Common in western dry zones.",
    color: "#d4a373"
  },
  {
    id: "loamy_clay",
    name: "Clayey Loam / Mixed",
    description: "Balanced mixture of sand, silt, and clay particles.",
    color: "#78593a"
  },
  {
    id: "unknown",
    name: "I don't know my soil type",
    description: "No worries! Our advisory will help identify it based on your region and crop performance.",
    color: "#6b7280"
  }
];

export const IRRIGATION_SOURCES = [
  { id: "borewell", label: "Tube well / Borewell", icon: "Drill" },
  { id: "canal", label: "Government Canal", icon: "Waves" },
  { id: "rainfed", label: "Rainfed (Monsoon only)", icon: "CloudRain" },
  { id: "open_well", label: "Open Well / Farm Pond", icon: "CircleDot" },
  { id: "river_stream", label: "River / Stream / Lift", icon: "Droplets" },
  { id: "drip_sprinkler", label: "Drip / Sprinkler System", icon: "Sprinkler" }
];

export const WATER_AVAILABILITY = [
  {
    id: "abundant",
    label: "Abundant",
    description: "Year-round water available whenever needed"
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Adequate for 1 to 2 crop cycles, depends on season"
  },
  {
    id: "scarce",
    label: "Scarce / Low",
    description: "Critical shortage or deep groundwater depletion"
  }
];

export const FARMING_SEASONS = [
  { id: "kharif", label: "Kharif (Monsoon: Jun – Oct)", tag: "Monsoon" },
  { id: "rabi", label: "Rabi (Winter: Oct – Mar)", tag: "Winter" },
  { id: "zaid", label: "Zaid (Summer: Mar – Jun)", tag: "Summer" },
  { id: "year_round", label: "Year-round (Multiple rotations)", tag: "Perennial" }
];

export const POPULAR_CROPS = [
  "Wheat",
  "Rice / Paddy",
  "Cotton",
  "Maize (Corn)",
  "Mustard / Rapeseed",
  "Sugarcane",
  "Soybean",
  "Potato",
  "Tomato",
  "Onion",
  "Chickpea (Gram)",
  "Chili",
  "Groundnut",
  "Bajra (Pearl Millet)"
];

export const CROP_STAGES = [
  { id: "germination", label: "Germination / Emergence (0–15 days)" },
  { id: "vegetative", label: "Vegetative Growth (15–45 days)" },
  { id: "flowering", label: "Flowering & Tillering (45–70 days)" },
  { id: "fruiting", label: "Fruiting / Grain Formation (70–100 days)" },
  { id: "ripening", label: "Ripening & Maturity (100–120 days)" },
  { id: "harvest", label: "Harvest Ready" },
  { id: "unsure", label: "Not sure / Need assessment" }
];

export const COMMON_FERTILIZERS = [
  "Urea (Nitrogen)",
  "DAP (Di-Ammonium Phosphate)",
  "NPK Complex (19:19:19 / 12:32:16)",
  "MOP (Muriate of Potash)",
  "Organic FYM / Cow Dung Compost",
  "Vermicompost",
  "Bio-fertilizers (Azotobacter, PSB)",
  "None yet"
];

export const IRRIGATION_FREQUENCIES = [
  "Every 2-3 days",
  "Once a week",
  "Every 10-15 days",
  "Only when rainfall is absent",
  "Need-based (based on soil dry appearance)"
];
