import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Sprout } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ProgressSteps } from "../components/common/OnboardingProgressSteps";
import { Step1Account } from "../components/onboarding/Step1Account";
import { Step2FarmProfile } from "../components/onboarding/Step2FarmProfile";
import { Step3FarmingStatus } from "../components/onboarding/Step3FarmingStatus";
import { Step4Review } from "../components/onboarding/Step4Review";
import { Step5Success } from "../components/onboarding/Step5Success";
import { useFarmerOnboarding } from "../hooks/useFarmerOnboarding";
import { createOnboardingAccount } from "../services/onboardingServices";
import { useTranslation } from "react-i18next";

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const editExistingProfile = searchParams.get("edit") === "1";
  const { login, isLoggedIn, user } = useAuth();
  const profileMode = editExistingProfile || isLoggedIn;
  const flow = useFarmerOnboarding({
    createAccount: createOnboardingAccount,
    onAuthenticated: login,
    editExistingProfile,
    isAuthenticated: isLoggedIn,
    authenticatedUser: user
  });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 dark:bg-stone-950 dark:text-stone-100 flex flex-col">
      <header className="h-16 border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800" aria-label={t("nav.home", { defaultValue: "Krishi AI home" })}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-900 text-emerald-100"><Sprout className="h-5 w-5" aria-hidden="true" /></span>
            <span className="font-bold tracking-tight text-emerald-950 dark:text-emerald-100">Krishi AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 bg-[#faf9f5] px-2.5 text-xs font-semibold text-stone-800 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100">
              <span className="sr-only">{t("nav.chooseLanguage", { defaultValue: "Choose language" })}</span>
              <select aria-label={t("nav.chooseLanguage", { defaultValue: "Choose language" })} value={i18n.resolvedLanguage?.split("-")[0] || "en"} onChange={(event) => i18n.changeLanguage(event.target.value)} className="cursor-pointer bg-transparent py-1 outline-none [color-scheme:light] dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-stone-900 dark:[&>option]:bg-stone-900 dark:[&>option]:text-white">
                <option value="en">English</option><option value="hi">हिन्दी</option><option value="ta">தமிழ்</option><option value="ur">اردو</option>
              </select>
            </label>
            <Link to="/login" className="text-sm font-semibold text-emerald-900 hover:underline underline-offset-4 dark:text-emerald-300">{t("onboarding.loginLink", { defaultValue: "Already registered? Log in" })}</Link>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
          {flow.integrationNotice && flow.currentStep < 5 && (
            <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
              <strong>Development preview:</strong> {flow.integrationNotice}
            </div>
          )}

          {flow.draftRestored && flow.currentStep < 5 && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
              <p><strong>Progress restored.</strong> Your non-sensitive answers were saved in this browser.</p>
              <button type="button" onClick={flow.resetForm} className="self-start font-semibold underline underline-offset-2 sm:self-auto">Start over</button>
            </div>
          )}

          {flow.currentStep < 5 && (
            <ProgressSteps
              currentStep={flow.currentStep}
              onStepClick={(step) => {
                if (profileMode && step === 1) return;
                flow.goToStep(step);
              }}
            />
          )}

          {flow.currentStep === 1 && (
            <Step1Account
              account={flow.profile.account}
              onChange={(updates) => flow.updateSection("account", updates)}
              onNext={flow.nextStep}
              onOpenLogin={() => navigate("/login")}
              errors={flow.errors}
              isSubmitting={flow.isSubmitting}
              serverError={flow.serverError}
            />
          )}
          {flow.currentStep === 2 && (
            <Step2FarmProfile
              farmLocation={flow.profile.farmLocation}
              onChange={(updates) => flow.updateSection("farmLocation", updates)}
              onNext={flow.nextStep}
              onPrev={profileMode ? () => navigate("/dashboard") : flow.prevStep}
              backLabel={profileMode ? "Back to dashboard" : "Back to Account"}
              errors={flow.errors}
            />
          )}
          {flow.currentStep === 3 && (
            <Step3FarmingStatus
              farmingStatus={flow.profile.farmingStatus}
              activeFarming={flow.profile.activeFarming}
              planningFarming={flow.profile.planningFarming}
              farmLocation={flow.profile.farmLocation}
              onStatusChange={(status) => flow.updateField("farmingStatus", status)}
              onActiveChange={(updates) => flow.updateSection("activeFarming", updates)}
              onPlanningChange={(updates) => flow.updateSection("planningFarming", updates)}
              onNext={flow.nextStep}
              onPrev={flow.prevStep}
              errors={flow.errors}
            />
          )}
          {flow.currentStep === 4 && (
            <Step4Review
              profile={flow.profile}
              onGoToStep={flow.goToStep}
              onComplete={flow.completeOnboarding}
              onPrev={flow.prevStep}
              isSubmitting={flow.isSubmitting}
              serverError={flow.serverError}
            />
          )}
          {flow.currentStep === 5 && (
            <Step5Success profile={flow.profile} completionResult={flow.completionResult} onReset={flow.resetForm} />
          )}
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 py-4 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        The full farm profile is saved in this browser in Phase 1; backend profile storage is not implemented yet.
      </footer>
    </div>
  );
}
