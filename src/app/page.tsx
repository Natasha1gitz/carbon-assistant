import ClientCarbonApp from "@/components/ClientCarbonApp";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="animate-slide-up mb-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-100/60 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-300">
          <span className="animate-pulse-ring h-2 w-2 rounded-full bg-emerald-500" />
          AI-Powered Carbon Intelligence
        </div>
        <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
          Know Your Impact. <span className="gradient-text">Make a Difference.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          Our intelligent platform calculates your carbon footprint and uses AI to provide
          highly personalized, actionable steps to reduce your environmental impact.
        </p>
      </div>

      <ClientCarbonApp />
    </div>
  );
}
