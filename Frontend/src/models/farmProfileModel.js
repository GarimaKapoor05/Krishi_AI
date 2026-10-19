/**
 * Krishi AI V2 - Farm Profile Data Model
 * 
 * Prepares a structured, future-proof payload for backend Phase 2 integration:
 * - Personalized crop recommendations (N-P-K, pH, season, irrigation)
 * - Organic fertilizer recommendations (FYM, vermicompost, target NPK)
 * - Smart irrigation advice (soil type, water availability, crop stage)
 * - Crop disease assistance (stage, crop name, photo upload capability)
 * - Mandi price intelligence (state, district, crop name)
 * - Personalized crop calendar (sowing date, crop stage, maturity cycle)
 */

export const createDefaultFarmProfile = () => ({
  // Account Information
  account: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false
  },

  // Farm Location & Physical Characteristics
  farmLocation: {
    village: "",
    district: "",
    state: "",
    pincode: "",
    farmSize: "",
    measurementUnit: "acres", // 'acres' | 'hectares'
    soilType: "", // from SOIL_TYPES id or 'unknown'
    irrigationSource: "", // from IRRIGATION_SOURCES
    waterAvailability: "moderate", // 'abundant' | 'moderate' | 'scarce'
    preferredSeason: "kharif" // 'kharif' | 'rabi' | 'zaid' | 'year_round'
  },

  // Farming Status Branch: 'active' | 'planning' | null
  farmingStatus: null,

  // Branch A: Farmer is already growing a crop
  activeFarming: {
    cropName: "",
    sowingDate: "",
    cropStage: "",
    fertilizersUsed: [],
    irrigationFrequency: ""
  },

  // Branch B: Farmer is planning to start
  planningFarming: {
    plannedSowingPeriod: "",
    farmingSeason: "",
    soilTestDone: "no", // 'yes' | 'no'
    soilNutrients: {
      nitrogen: "",
      phosphorus: "",
      potassium: "",
      ph: ""
    },
    waterAvailability: "moderate",
    interestedCrops: [],
    soilPhoto: null, // { name, size, dataUrl, previewUrl }
    soilPhotoDisclaimerAcknowledged: false
  },

  // System & Onboarding Metadata
  meta: {
    createdAt: new Date().toISOString(),
    completedAt: null,
    schemaVersion: "2.0.0",
    isDraft: true
  }
});

/**
 * Validates step 1 fields
 */
export const validateStep1Account = (account) => {
  const errors = {};
  if (!account.firstName?.trim()) errors.firstName = "First name is required";
  if (!account.lastName?.trim()) errors.lastName = "Last name is required";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!account.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!emailRegex.test(account.email.trim())) {
    errors.email = "Please enter a valid email address (e.g. farmer@krishi.in)";
  }

  if (!account.password) {
    errors.password = "Password is required";
  } else if (account.password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (!account.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (account.password !== account.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!account.termsAccepted) {
    errors.termsAccepted = "You must acknowledge the Terms of Service & Privacy Policy to proceed";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates step 2 fields
 */
export const validateStep2FarmProfile = (farmLocation) => {
  const errors = {};
  if (!farmLocation.village?.trim()) errors.village = "Village or town name is required";
  if (!farmLocation.state?.trim()) errors.state = "Please select your state";
  if (!farmLocation.district?.trim()) errors.district = "District is required";

  if (farmLocation.pincode?.trim()) {
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(farmLocation.pincode.trim())) {
      errors.pincode = "Please enter a valid 6-digit Indian PIN code";
    }
  }

  if (!farmLocation.farmSize || Number(farmLocation.farmSize) <= 0) {
    errors.farmSize = "Please enter a valid farm land size (greater than 0)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates step 3 fields based on selected branch
 */
export const validateStep3FarmingStatus = (status, activeFarming, planningFarming) => {
  const errors = {};
  if (!status) {
    errors.status = "Please choose whether you have already started or are planning to start";
    return { isValid: false, errors };
  }

  if (status === "active") {
    if (!activeFarming.cropName?.trim()) {
      errors.cropName = "Please specify the crop you are currently cultivating";
    }
    if (!activeFarming.sowingDate) {
      errors.sowingDate = "Approximate sowing or planting date is required";
    }
  } else if (status === "planning") {
    if (!planningFarming.plannedSowingPeriod?.trim()) {
      errors.plannedSowingPeriod = "Please specify your planned sowing period";
    }
    if (!planningFarming.farmingSeason?.trim()) {
      errors.farmingSeason = "Please select your planned farming season";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
