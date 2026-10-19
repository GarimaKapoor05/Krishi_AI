import React from "react";
import { UserCheck, MapPin, Sprout, CheckSquare, Check } from "lucide-react";

export const STEPS = [
  { id: 1, name: "Account", desc: "Farmer identity", icon: UserCheck },
  { id: 2, name: "Farm Profile", desc: "Location & soil", icon: MapPin },
  { id: 3, name: "Farming Status", desc: "Crop activity", icon: Sprout },
  { id: 4, name: "Review", desc: "Confirm details", icon: CheckSquare }
];

export function ProgressSteps({ currentStep, onStepClick }) {
  if (currentStep > 4) return null; // Don't show in success step

  return (
    <div className="w-full mb-8">
      {/* Mobile Step Header */}
      <div className="block md:hidden mb-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-green mb-1">
          <span>Step {currentStep} of 4</span>
          <span>{STEPS[currentStep - 1]?.name}</span>
        </div>
        <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-green h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Tracker */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Continuous connector line */}
        <div className="absolute left-6 right-6 top-6 -translate-y-1/2 h-0.5 bg-brand-border -z-0" />
        <div
          className="absolute left-6 top-6 -translate-y-1/2 h-0.5 bg-brand-green -z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = isCompleted; // can go back to completed steps

          const IconComponent = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center text-center ${
                isClickable ? "cursor-pointer group" : "cursor-default"
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2 ${
                  isCompleted
                    ? "bg-brand-green text-white border-brand-green shadow-sm"
                    : isCurrent
                    ? "bg-brand-mint text-brand-green border-brand-green ring-4 ring-brand-mint/60 shadow-md"
                    : "bg-brand-surface text-stone-400 border-brand-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              {/* Step Labels */}
              <div className="mt-2.5">
                <span
                  className={`block text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "text-brand-green"
                      : isCompleted
                      ? "text-stone-800 group-hover:text-brand-green"
                      : "text-stone-400"
                  }`}
                >
                  {step.name}
                </span>
                <span className="block text-xs text-stone-400">{step.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
