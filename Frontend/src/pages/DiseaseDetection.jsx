import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  Loader2,
  Sparkles,
  Leaf,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function DiseaseDetection() {
  const { t } = useTranslation();

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));

    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError(t("diseaseDetection.alertUpload"));
      return;
    }

    setLoading(true);
    setError("");

    // Temporary Demo Response
    setTimeout(() => {
      setResult({
        disease: "Tomato Early Blight",
        confidence: 96.4,
        health_score: 89,
      });

      setLoading(false);
    }, 1800);
  };
    return (
    <div className="min-h-screen bg-[#F8FBF8] dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-14">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-green-50 dark:from-gray-800 dark:to-gray-700 shadow-sm mb-6">
            <Leaf className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-emerald-950 dark:text-white">
            {t("diseaseDetection.title")}
          </h1>

          <p className="mt-4 text-lg text-emerald-700 dark:text-gray-300 max-w-2xl mx-auto leading-8">
            {t("diseaseDetection.desc")}
          </p>

        </div>

        {/* Upload Card */}

        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-600 shadow-sm p-8 md:p-10">

          <div className="mb-8">

            <h2 className="text-2xl font-semibold text-emerald-900 dark:text-white">
              {t("diseaseDetection.uploadLeaf")}
            </h2>

            <p className="mt-2 text-emerald-600 dark:text-gray-400">
              {t("diseaseDetection.formats")}
            </p>

          </div>

          <label className="block cursor-pointer">

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="border-2 border-dashed border-emerald-200 dark:border-gray-600 rounded-3xl p-12 text-center hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all">

              <Upload className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-5" />

              <h3 className="text-xl font-semibold text-emerald-900 dark:text-white">
                {t("diseaseDetection.clickUpload")}
              </h3>

              <p className="text-emerald-600 dark:text-gray-400 mt-2">
                {t("diseaseDetection.dragDrop")}
              </p>

            </div>

          </label>
                  {/* Image Preview */}

        {preview && (
          <div className="mt-8">

            <img
              src={preview}
              alt="Leaf Preview"
              className="w-full max-h-[420px] object-contain rounded-3xl border border-emerald-100 dark:border-gray-600 bg-emerald-50 dark:bg-gray-800"
            />

          </div>
        )}

        {/* Analyze Button */}

        <div className="mt-8">

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all text-white py-4 text-lg font-semibold flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("diseaseDetection.analyzing")}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t("diseaseDetection.btnPredict")}
              </>
            )}
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 flex gap-3">

            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>
        )}

      </div>

      {/* Results */}
      // FIX 6: Show maintenance message when model is under maintenance 
        {result && (
          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">
              🔧 Model Under Maintenance
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Our disease detection model is being upgraded. Please check back soon or consult your local Krishi Vigyan Kendra.
            </p>
          </div>
        )}


        {/* Body */}

            <div className="p-8">
              <div className="text-center mb-10">
                <div className="text-6xl mb-4">
                  🌿
                </div>
                <h3 className="text-4xl font-bold text-emerald-950 dark:text-white">
                  {result.disease}
                </h3>
                <p className="text-emerald-600 dark:text-gray-400 mt-3">
                  {t("diseaseDetection.recDesc")}
                </p>
              </div>

              {/* Metrics */}

              <div className="grid md:grid-cols-3 gap-5 mb-8">

                <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/20 p-6">

                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                    {t("diseaseDetection.confidence")}
                  </p>

                  <h4 className="text-3xl font-bold text-emerald-950 dark:text-white">
                    {result.confidence}%
                  </h4>

                </div>

                <div className="rounded-2xl border border-sky-100 dark:border-sky-900/30 bg-sky-50 dark:bg-sky-900/20 p-6">

                  <p className="text-sm text-sky-700 dark:text-sky-300 mb-2">
                    {t("diseaseDetection.healthScore")}
                  </p>

                  <h4 className="text-3xl font-bold text-sky-900 dark:text-white">
                    {result.health_score}/100
                  </h4>

                </div>

                <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/20 p-6">

                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                    {t("diseaseDetection.riskLevel")}
                  </p>

                  <h4 className="text-3xl font-bold text-amber-900 dark:text-white">
                    Moderate
                  </h4>

                </div>

              </div>
                            {/* Recommendations */}

              <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20 p-6">

                <h4 className="text-xl font-semibold text-emerald-950 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {t("diseaseDetection.actions")}
                </h4>

                <ul className="space-y-3 text-emerald-800 dark:text-gray-300">

                  <li>✅ Remove infected leaves to reduce disease spread.</li>

                  <li>✅ Inspect nearby plants for similar symptoms.</li>

                  <li>✅ Ensure proper air circulation around the crop.</li>

                  <li>✅ Consult a local agricultural expert before applying fungicides.</li>

                </ul>

              </div>

              {/* Analyze Another */}

              <div className="mt-8 text-center">

                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreview(null);
                    setResult(null);
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-700 px-6 py-3 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  {t("diseaseDetection.btnAnother")}
                </button>
              </div>
            </div>
          </div>
      </div>
  );
}