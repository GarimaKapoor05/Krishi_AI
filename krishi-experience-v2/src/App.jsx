import React, { useState } from "react";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import { ProgressSteps } from "./components/common/ProgressSteps";
import { Step1Account } from "./components/onboarding/Step1Account";
import { Step2FarmProfile } from "./components/onboarding/Step2FarmProfile";
import { Step3FarmingStatus } from "./components/onboarding/Step3FarmingStatus";
import { Step4Review } from "./components/onboarding/Step4Review";
import { Step5Success } from "./components/onboarding/Step5Success";
import { LoginModal } from "./components/auth/LoginModal";
import { useOnboarding } from "./hooks/useOnboarding";

export function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const {
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
    resetForm
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col font-sans text-stone-800 antialiased selection:bg-brand-mint selection:text-brand-green">
      <Header onOpenLogin={() => setIsLoginOpen(true)} />

      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
          {integrationNotice && currentStep < 5 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              {integrationNotice}
            </div>
          )}

          {draftRestored && currentStep < 5 && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-brand-leaf/30 bg-brand-mint/30 px-4 py-3 text-sm text-brand-green">
              <p><strong>Progress restored.</strong> Your non-sensitive answers were saved in this browser.</p>
              <button type="button" onClick={resetForm} className="self-start sm:self-auto font-semibold underline underline-offset-2">
                Start over
              </button>
            </div>
          )}

          {currentStep < 5 && <ProgressSteps currentStep={currentStep} onStepClick={goToStep} />}

          {currentStep === 1 && (
            <Step1Account
              account={profile.account}
              onChange={(updates) => updateSection("account", updates)}
              onNext={nextStep}
              onOpenLogin={() => setIsLoginOpen(true)}
              errors={errors}
              isSubmitting={isSubmitting}
              serverError={serverError}
            />
          )}
          {currentStep === 2 && (
            <Step2FarmProfile
              farmLocation={profile.farmLocation}
              onChange={(updates) => updateSection("farmLocation", updates)}
              onNext={nextStep}
              onPrev={prevStep}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <Step3FarmingStatus
              farmingStatus={profile.farmingStatus}
              activeFarming={profile.activeFarming}
              planningFarming={profile.planningFarming}
              onStatusChange={(status) => updateField("farmingStatus", status)}
              onActiveChange={(updates) => updateSection("activeFarming", updates)}
              onPlanningChange={(updates) => updateSection("planningFarming", updates)}
              onNext={nextStep}
              onPrev={prevStep}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <Step4Review
              profile={profile}
              onGoToStep={goToStep}
              onComplete={completeOnboarding}
              onPrev={prevStep}
              isSubmitting={isSubmitting}
              serverError={serverError}
            />
          )}
          {currentStep === 5 && (
            <Step5Success
              profile={profile}
              completionResult={completionResult}
              onReset={resetForm}
            />
          )}
        </div>
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => setIsLoginOpen(false)}
      />
    </div>
  );
}

export default App;
