import { useCallback, useEffect, useState } from "react";
import {
  createDefaultFarmProfile,
  validateStep1Account,
  validateStep2FarmProfile,
  validateStep3FarmingStatus
} from "../models/farmProfileModel";
import { saveFarmProfileLocally } from "../services/onboardingServices";

const DRAFT_KEY = "krishi_frontend_onboarding_draft_v1";
const PROFILE_KEY = "krishi_farm_profile_v2";

function draftFromProfile(profile, step) {
  const planningFarming = { ...profile.planningFarming };
  if (planningFarming.soilPhoto) {
    planningFarming.soilPhoto = {
      name: planningFarming.soilPhoto.name,
      size: planningFarming.soilPhoto.size,
      type: planningFarming.soilPhoto.type
    };
  }
  return {
    account: {
      firstName: profile.account.firstName,
      lastName: profile.account.lastName,
      email: profile.account.email,
      termsAccepted: profile.account.termsAccepted
    },
    farmLocation: profile.farmLocation,
    farmingStatus: profile.farmingStatus,
    activeFarming: profile.activeFarming,
    planningFarming,
    _savedStep: step
  };
}

export function useFarmerOnboarding({ createAccount, onAuthenticated, editExistingProfile = false, isAuthenticated = false, authenticatedUser = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(createDefaultFarmProfile);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [integrationNotice, setIntegrationNotice] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    try {
      if (editExistingProfile || isAuthenticated) {
        const rawProfile = localStorage.getItem(PROFILE_KEY);
        const saved = rawProfile ? JSON.parse(rawProfile) : null;
        setProfile((initial) => ({
          ...initial,
          ...(saved || {}),
          account: {
            ...initial.account,
            email: authenticatedUser?.email || "",
            ...(saved?.account || {}),
            password: "",
            confirmPassword: ""
          }
        }));
        setAccountCreated(true);
        setCurrentStep(2);
        return;
      }

      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setProfile((initial) => ({
        ...initial,
        ...saved,
        account: {
          ...initial.account,
          ...saved.account,
          password: "",
          confirmPassword: ""
        }
      }));
      if (saved._savedStep >= 1 && saved._savedStep <= 4) setCurrentStep(saved._savedStep);
      setDraftRestored(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [authenticatedUser?.email, editExistingProfile, isAuthenticated]);

  useEffect(() => {
    if (currentStep === 5) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftFromProfile(profile, currentStep)));
    } catch {
      // Onboarding remains usable if browser storage is unavailable.
    }
  }, [profile, currentStep]);

  const updateSection = useCallback((section, updates) => {
    setProfile((current) => ({ ...current, [section]: { ...current[section], ...updates } }));
    setErrors((current) => {
      const next = { ...current };
      Object.keys(updates).forEach((key) => delete next[key]);
      return next;
    });
    setServerError(null);
  }, []);

  const updateField = useCallback((field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setServerError(null);
  }, []);

  const validateCurrentStep = useCallback(() => {
    let result = { isValid: true, errors: {} };
    if (currentStep === 1) result = validateStep1Account(profile.account);
    if (currentStep === 2) result = validateStep2FarmProfile(profile.farmLocation);
    if (currentStep === 3) {
      result = validateStep3FarmingStatus(profile.farmingStatus, profile.activeFarming, profile.planningFarming);
    }
    setErrors(result.errors);
    return result.isValid;
  }, [currentStep, profile]);

  const nextStep = useCallback(async () => {
    setServerError(null);
    if (!validateCurrentStep()) return false;

    if (currentStep === 1 && !accountCreated) {
      setIsSubmitting(true);
      try {
        const result = await createAccount({ account: profile.account, farmLocation: profile.farmLocation });
        if (result.source === "backend") {
          const { access_token: token, user } = result.data || {};
          if (token && user) onAuthenticated(token, user);
          setIntegrationNotice(null);
        } else {
          setIntegrationNotice(result.message);
        }
        setAccountCreated(true);
      } catch (error) {
        setServerError(error.message || "Account creation failed. Please try again.");
        setIsSubmitting(false);
        return false;
      }
      setIsSubmitting(false);
    }

    setCurrentStep((step) => Math.min(step + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [accountCreated, createAccount, currentStep, onAuthenticated, profile, validateCurrentStep]);

  const prevStep = useCallback(() => {
    setServerError(null);
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback((step) => {
    if (step < 1 || step > 4 || step > currentStep) return;
    setServerError(null);
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const result = saveFarmProfileLocally(profile);
      setCompletionResult({
        ...result,
        note: [integrationNotice, result.note].filter(Boolean).join(" ")
      });
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setServerError(error.message || "Could not save the farm profile.");
    } finally {
      setIsSubmitting(false);
    }
  }, [integrationNotice, profile]);

  const resetForm = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setProfile(createDefaultFarmProfile());
    setCurrentStep(1);
    setErrors({});
    setServerError(null);
    setIntegrationNotice(null);
    setDraftRestored(false);
    setCompletionResult(null);
    setAccountCreated(false);
  }, []);

  return {
    currentStep,
    profile,
    errors,
    isSubmitting,
    serverError,
    integrationNotice,
    draftRestored,
    completionResult,
    updateSection,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    resetForm
  };
}
