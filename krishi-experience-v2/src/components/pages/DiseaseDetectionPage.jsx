import React, { useState } from "react";
import {
  ShieldAlert,
  Camera,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info
} from "lucide-react";

export function DiseaseDetectionPage({ onBackToDashboard }) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setDiagnosisResult({
          diseaseName: "Early Yellow Rust (Puccinia striiformis)",
          confidence: "92.4%",
          severity: "Mild to Moderate",
          symptoms: "Yellowish-orange pustules arranged in linear stripes on upper leaf blades.",
          organicRemedies: [
            "Foliar spray of 5% Neem Seed Kernel Extract (NSKE).",
            "Spray Trichoderma viride bio-fungicide (5g/liter of water).",
            "Ensure field borders are cleared of volunteer wild grassy weed hosts."
          ],
          chemicalRemedies: [
            "Propiconazole 25% EC @ 1 ml/liter of water in sunny weather."
          ],
          integrationNote: "Phase 2 Preview: Live Computer Vision model endpoint POST /predict-disease will connect in Phase 2."
        });
      }, 1200);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 mb-6 border-b border-brand-border">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-sand transition-colors text-stone-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
              Crop Disease &amp; Pest Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              Diagnostic Module
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Identify crop leaf infections and receive immediate bio-organic remedies
          </p>
        </div>
      </div>

      {/* Upload & Camera Section */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
        <div className="text-center max-w-lg mx-auto py-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Upload or Capture Crop Leaf Photo
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Take a clear, well-lit photo of the affected leaf showing visible spots or discoloration.
          </p>

          <label className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Select Leaf Image</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Status / Diagnosis Output */}
        {analyzing && (
          <div className="p-8 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analyzing leaf texture and pathogen lesion patterns...
          </div>
        )}

        {diagnosisResult && (
          <div className="mt-6 pt-6 border-t border-brand-border space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Diagnosis Result
                </span>
                <h4 className="text-lg font-extrabold text-stone-900 mt-0.5">
                  {diagnosisResult.diseaseName}
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-brand-green">
                {diagnosisResult.confidence} Match
              </span>
            </div>

            <p className="text-xs text-stone-700 bg-brand-sand p-3.5 rounded-xl border border-brand-border">
              <strong>Symptoms:</strong> {diagnosisResult.symptoms}
            </p>

            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Recommended Organic &amp; Cultural Controls:
              </h5>
              <ul className="space-y-1.5 text-xs text-stone-700 list-disc pl-5">
                {diagnosisResult.organicRemedies.map((rem, i) => (
                  <li key={i}>{rem}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-center space-x-2">
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
              <span>{diagnosisResult.integrationNote}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
