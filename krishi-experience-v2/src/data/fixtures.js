/**
 * Development fixtures for testing and demoing the onboarding experience
 */

export const DEMO_PROFILES = {
  activeWheatFarmer: {
    account: {
      firstName: "Gurpreet",
      lastName: "Singh",
      email: "gurpreet.singh@example.com",
      password: "securepassword123",
      confirmPassword: "securepassword123",
      termsAccepted: true
    },
    farmLocation: {
      village: "Khanna Kalan",
      district: "Ludhiana",
      state: "Punjab",
      pincode: "141401",
      farmSize: "4.5",
      measurementUnit: "acres",
      soilType: "alluvial",
      irrigationSource: "borewell",
      waterAvailability: "abundant",
      preferredSeason: "rabi"
    },
    farmingStatus: "active",
    activeFarming: {
      cropName: "Wheat",
      sowingDate: "2026-11-10",
      cropStage: "vegetative",
      fertilizersUsed: ["Urea (Nitrogen)", "DAP (Di-Ammonium Phosphate)"],
      irrigationFrequency: "Every 10-15 days"
    },
    planningFarming: {
      plannedSowingPeriod: "",
      farmingSeason: "",
      soilTestDone: "no",
      soilNutrients: { nitrogen: "", phosphorus: "", potassium: "", ph: "" },
      waterAvailability: "moderate",
      interestedCrops: [],
      soilPhoto: null,
      soilPhotoDisclaimerAcknowledged: false
    }
  },

  planningCottonFarmer: {
    account: {
      firstName: "Ramesh",
      lastName: "Patil",
      email: "ramesh.patil@example.com",
      password: "securepassword123",
      confirmPassword: "securepassword123",
      termsAccepted: true
    },
    farmLocation: {
      village: "Akola Khurd",
      district: "Akola",
      state: "Maharashtra",
      pincode: "444001",
      farmSize: "3",
      measurementUnit: "acres",
      soilType: "black",
      irrigationSource: "rainfed",
      waterAvailability: "moderate",
      preferredSeason: "kharif"
    },
    farmingStatus: "planning",
    activeFarming: {
      cropName: "",
      sowingDate: "",
      cropStage: "",
      fertilizersUsed: [],
      irrigationFrequency: ""
    },
    planningFarming: {
      plannedSowingPeriod: "June 2026 (Onset of monsoon)",
      farmingSeason: "kharif",
      soilTestDone: "yes",
      soilNutrients: { nitrogen: "65", phosphorus: "42", potassium: "40", ph: "7.2" },
      waterAvailability: "moderate",
      interestedCrops: ["Cotton", "Soybean"],
      soilPhoto: null,
      soilPhotoDisclaimerAcknowledged: true
    }
  }
};
