import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  RefreshCw
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const MAX_SIDE = 640; // the model looks at 224x224, so there is no need to upload full-size phone photos
const REQUEST_TIMEOUT_MS = 90000; // Render's free tier can take ~1 minute to wake up

// Shrink a photo in the browser before upload: faster on mobile data and avoids size limits.
async function shrinkImage(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (bitmap.close) bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    return blob || file;
  } catch {
    return file; // unsupported format in this browser: let the server decide
  }
}

function RemedyList({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h5 className="font-bold text-xs uppercase tracking-wider text-stone-800">{title}</h5>
      <ul className="space-y-1.5 text-xs text-stone-700 list-disc pl-5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function DiseaseDetectionPage({ onBackToDashboard }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [slow, setSlow] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const lastFile = useRef(null);
  const galleryInput = useRef(null);
  const cameraInput = useRef(null);

  // free the preview URL when it changes or the page closes
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const analyze = async (file) => {
    lastFile.current = file;
    setStatus("analyzing");
    setSlow(false);
    setResult(null);
    setErrorMsg("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const slowTimer = setTimeout(() => setSlow(true), 8000);

    try {
      const blob = await shrinkImage(file);
      const form = new FormData();
      form.append("image", blob, "leaf.jpg");

      const res = await fetch(`${API_URL}/predict-disease`, {
        method: "POST",
        body: form,
        signal: controller.signal
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON error page */
      }
      if (!res.ok) {
        throw new Error(data?.error || `The server returned an error (${res.status}).`);
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(
        err.name === "AbortError"
          ? "The server took too long to respond. Please try again in a moment."
          : err instanceof TypeError
          ? "Could not reach the server. Check your internet connection and try again."
          : err.message
      );
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      clearTimeout(slowTimer);
      setSlow(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same photo again
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file (JPG or PNG).");
      setStatus("error");
      return;
    }
    setPhotoUrl(URL.createObjectURL(file));
    analyze(file);
  };

  const reset = () => {
    setPhotoUrl(null);
    setResult(null);
    setErrorMsg("");
    setStatus("idle");
    lastFile.current = null;
  };

  const prediction = result?.prediction;
  const uncertain = result?.status === "uncertain";
  const healthy = prediction?.is_healthy && !uncertain;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 mb-6 border-b border-brand-border">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-sand transition-colors text-stone-600"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
              Crop Disease &amp; Pest Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              AI Diagnosis
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Identify crop leaf infections and get organic and cultural remedies
          </p>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-2xl shadow-card p-6 mb-8">
        {/* Upload area */}
        {status === "idle" && (
          <div className="text-center max-w-lg mx-auto py-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">Upload or Capture a Leaf Photo</h3>
            <p className="text-xs text-stone-500 mb-6">
              Take a clear, well-lit photo of a single affected leaf, filling most of the frame. Avoid blur and
              heavy shadows.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => cameraInput.current?.click()}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInput.current?.click()}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand-surface border border-brand-border text-stone-800 hover:bg-brand-sand active:scale-[0.98] transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Select from Gallery</span>
              </button>
            </div>

            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              className="hidden"
            />
            <input ref={galleryInput} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>
        )}

        {/* Photo preview (kept visible during analysis, result and error) */}
        {photoUrl && status !== "idle" && (
          <div className="flex justify-center mb-6">
            <img
              src={photoUrl}
              alt="Selected leaf"
              className="max-h-64 rounded-xl border border-brand-border object-contain"
            />
          </div>
        )}

        {/* Analysing */}
        {status === "analyzing" && (
          <div className="p-6 text-center text-xs text-stone-500" role="status">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Analysing leaf texture and lesion patterns...
            {slow && (
              <p className="mt-2 text-[11px] text-stone-400">
                The server may be waking up after being idle. The first scan can take up to a minute.
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold mb-1">We couldn't analyse this photo</p>
              <p>{errorMsg}</p>
              <div className="flex gap-3 mt-3">
                {lastFile.current && (
                  <button
                    type="button"
                    onClick={() => analyze(lastFile.current)}
                    className="inline-flex items-center space-x-1 font-bold underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
                <button type="button" onClick={reset} className="font-bold underline">
                  Choose another photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {status === "done" && prediction && (
          <div className="space-y-4 animate-fade-in">
            {uncertain && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  We're not confident about this result. Try another photo: one leaf, good daylight, in focus. The
                  best guesses are listed below, but please treat them with care.
                </span>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  {uncertain ? "Possible Match" : "Diagnosis Result"}
                </span>
                <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 flex items-center gap-2">
                  {healthy && <CheckCircle2 className="w-5 h-5 text-brand-green" />}
                  {prediction.crop}: {prediction.display_name}
                </h4>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  uncertain ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-brand-green"
                }`}
              >
                {prediction.confidence_pct}% match
              </span>
            </div>

            {/* Confidence bar */}
            <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden" aria-hidden="true">
              <div
                className={`h-full rounded-full ${uncertain ? "bg-amber-400" : "bg-brand-green"}`}
                style={{ width: `${Math.min(100, prediction.confidence_pct)}%` }}
              />
            </div>

            {result.advice?.symptoms && (
              <p className="text-xs text-stone-700 bg-brand-sand p-3.5 rounded-xl border border-brand-border">
                <strong>{healthy ? "Observation:" : "Typical symptoms:"}</strong> {result.advice.symptoms}
              </p>
            )}

            {!uncertain && (
              <>
                <RemedyList title="Recommended Organic & Cultural Controls" items={result.advice?.organic_remedies} />
                <RemedyList title="Chemical Options (consult an expert)" items={result.advice?.chemical_remedies} />
                <RemedyList
                  title={healthy ? "Keep Your Crop Healthy" : "Prevention"}
                  items={result.advice?.prevention}
                />
              </>
            )}

            {result.top_predictions?.length > 1 && (
              <div className="space-y-1.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-800">Other possibilities</h5>
                <ul className="text-xs text-stone-600 space-y-1">
                  {result.top_predictions.slice(1).map((p) => (
                    <li key={p.label} className="flex justify-between">
                      <span>
                        {p.crop}: {p.display_name}
                      </span>
                      <span className="text-stone-400">{p.confidence_pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex items-start space-x-2">
              <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>

            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-brand-green text-white hover:bg-brand-primary active:scale-[0.98] transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan another leaf</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
