import { Link } from "react-router-dom";
import { ArrowRight, Sprout } from "lucide-react";

export default function LandingPage() {
  return (
    <section className="min-h-[calc(100svh-5rem)] flex items-center px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mx-auto mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Sprout size={28} aria-hidden="true" />
        </div>
        <p className="mb-4 text-sm font-semibold tracking-wide text-emerald-800 dark:text-emerald-300">
          Practical support for your farm
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-stone-900 dark:text-white sm:text-6xl">
          Plan your season with confidence.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
          Create your farm profile to get a crop plan, a simple activity calendar, and local weather in one place.
        </p>
        <div className="mt-8">
          <Link
            to="/onboarding"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Set up your farm
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <p className="mt-5 text-sm text-stone-500 dark:text-stone-400">
          Crop planning · Weather · Farmer services
        </p>
      </div>
    </section>
  );
}
