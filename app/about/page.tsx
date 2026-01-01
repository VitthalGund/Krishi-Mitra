export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emerald-950 font-sans p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
          Our Mission
        </h1>
        <p className="text-lg text-slate-600 dark:text-emerald-100 mb-8 leading-relaxed">
          Krishi-Mitra is built with a singular vision:{" "}
          <span className="font-bold text-emerald-600 dark:text-yellow-400">
            Financial Inclusion for Every Farmer.
          </span>
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            The &quot;Zero Cost&quot; Architecture
          </h2>
          <p className="text-slate-600 dark:text-emerald-200 mb-4">
            Most AI solutions require expensive cloud GPUs and high-latency
            APIs. We flip the script.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-emerald-200">
            <li>
              **Edge Computing:** Authentication and Logic run on Vercel Edge
              Network.
            </li>
            <li>
              **Browser Native AI:** We use the Web Speech API for voice
              processing, running entirely on the user&apos;s device
              (Phone/Laptop) at zero cost.
            </li>
            <li>
              **Sovereign Data:** Your data stays within Indian borders,
              adhering to strict privacy norms (AgriStack ready).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            Meet the Team
          </h2>
          <p className="text-slate-600 dark:text-emerald-200">
            Developed by <strong>Vitthal Gund</strong>, leveraging cutting-edge
            Applied AI to solve Bharat&apos;s oldest problem.
          </p>
        </section>
      </div>
    </div>
  );
}
