import { useState, useEffect, useCallback } from "react";
import {
  createDefaultFarmProfile,
  validateStep1Account,
  validateStep2FarmProfile,
  validateStep3FarmingStatus
} from "../models/farmProfileModel";
import { authService } from "../services/authService";
import { farmProfileService } from "../services/farmProfileService";
import { DEMO_PROFILES } from "../data/fixtures";

const DRAFT_KEY = "krishi_onboarding_draft_v2";

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState(createDefaultFarmProfile());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [integrationNotice, setIntegrationNotice] = useState(null);

  // Restore non-sensitive draft on initial mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
          account: {
            ...prev.account,
            ...parsed.account,
            password: "", // Never restore passwords
            confirmPassword: ""
          }
        }));
        if (parsed._savedStep && parsed._savedStep >= 1 && parsed._savedStep <= 4) {
          setCurrentStep(parsed._savedStep);
        }
        setDraftRestored(true);
      }
    } catch (e) {
      console.warn("Failed to load onboarding draft", e);
    }
  }, []);

  // Autosave draft (sanitized without passwords) whenever profile or step changes
  useEffect(() => {
    if (currentStep === 5) {
      // Flow completed, clean draft
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    try {
      const draftToSave = {
        farmLocation: profile.farmLocation,
        farmingStatus: profile.farmingStatus,
        activeFarming: profile.activeFarming,
        planningFarming: profile.planningFarming,
        account: {
          firstName: profile.account.firstName,
          lastName: profile.account.lastName,
          email: profile.account.email,
          termsAccepted: profile.account.termsAccepted
        },
        _savedStep: currentStep
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
    } catch (e) {
      // quota or private mode
    }
  }, [profile, currentStep]);

  // Update specific section of profile
  const updateSection = useCallback((section, updates) => {
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    // Clear relevant errors
    setErrors((prevErrors) => {
      const updated = { ...prevErrors };
      Object.keys(updates).forEach((key) => delete updated[key]);
      return updated;
    });
    setServerError(null);
  }, []);

  // Update top-level field (like farmingStatus)
  const updateField = useCallback((field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setServerError(null);
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    if (currentStep === 1) {
      const res = validateStep1Account(profile.account);
      setErrors(res.errors);
      return res.isValid;
    }
    if (currentStep === 2) {
      const res = validateStep2FarmProfile(profile.farmLocation);
      setErrors(res.errors);
      return res.isValid;
    }
    if (currentStep === 3) {
      const res = validateStep3FarmingStatus(
        profile.farmingStatus,
        profile.activeFarming,
        profile.planningFarming
      );
      setErrors(res.errors);
      return res.isValid;
    }
    return true;
  }, [currentStep, profile]);

  // Navigate to next step
  const nextStep = useCallback(async () => {
    setServerError(null);
    if (!validateCurrentStep()) return false;

    // When completing step 1, attempt registration in background / session
    if (currentStep === 1) {
      setIsSubmitting(true);
      try {
        const registration = await authService.register({
          firstName: profile.account.firstName,
          lastName: profile.account.lastName,
          email: profile.account.email,
          password: profile.account.password,
          farmSize: profile.farmLocation.farmSize,
          location: `${profile.farmLocation.village || ""}, ${profile.farmLocation.district || ""}`
        });
        if (registration.source === "dev_mock_fixture") {
          setIntegrationNotice("Development mode: the backend is unavailable, so this account uses a temporary local fixture. It is not a real registered account.");
        } else {
          setIntegrationNotice(null);
        }
      } catch (err) {
        // If server returned email in use or other rejection
        setServerError(err.message || "Failed to initialize account");
        setIsSubmitting(false);
        return false;
      }
      setIsSubmitting(false);
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [currentStep, validateCurrentStep, profile]);

  // Navigate back
  const prevStep = useCallback(() => {
    setServerError(null);
    setIntegrationNotice(null);
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Direct step jump (used in Step 4 Review edit links)
  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 4) {
      setServerError(null);
      setErrors({});
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Final submission on Step 4
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    setServerError(null);
    setIntegrationNotice(null);

    try {
      const saveRes = await farmProfileService.saveProfile(profile);
      setCompletionResult(saveRes);
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(err.message || "Failed to finalize farm profile");
    } finally {
      setIsSubmitting(false);
    }
  }, [profile]);

  // Clear draft & start over
  const resetForm = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setProfile(createDefaultFarmProfile());
    setCurrentStep(1);
    setErrors({});
    setServerError(null);
    setIntegrationNotice(null);
    setCompletionResult(null);
    setDraftRestored(false);
  }, []);

  // Pre-load demo fixture for easy evaluator walkthrough
  const loadDemoFixture = useCallback((fixtureType = "activeWheatFarmer") => {
    const fixture = DEMO_PROFILES[fixtureType];
    if (fixture) {
      setProfile({
        ...createDefaultFarmProfile(),
        ...JSON.parse(JSON.stringify(fixture))
      });
      setErrors({});
      setServerError(null);
    }
  }, []);

  return {
    currentStep,
    profile,
    errors,
    isSubmitting,
    serverError,
    draftRestored,
    completionResult,
    integrationNotice,
    updateSection,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    resetForm,
    loadDemoFixture
  };
}
