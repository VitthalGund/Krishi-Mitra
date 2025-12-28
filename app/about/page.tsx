import Image from "next/image";
import { User, Cpu, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Empowering the Invisible Farmer
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Krishi Mitra is a mission to eliminate financial exclusion for the
            51% of Indian farmers who are invisible to the formal banking
            system.
          </p>
        </div>

        {/* Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-semibold text-sm">
              Our Mission
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Democratizing Credit with Voice AI
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Traditional banking requires piles of paperwork, multiple branch
              visits, and literacy. For many rural farmers, this is a barrier
              they cannot cross.
              <br />
              <br />
              **Krishi Mitra** changes this. By using advanced Voice AI, we
              allow farmers to talk in their own language (Hindi, Marathi,
              Tamil) to apply for government-backed loans. No forms. No
              middlemen. Just voice.
            </p>
          </div>
          <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <div className="text-6xl font-bold text-emerald-400 mb-2">
                51%
              </div>
              <div className="text-xl font-medium mb-8">
                of farmers lack formal credit access
              </div>
              <div className="h-px bg-white/20 mb-8"></div>
              <div className="text-6xl font-bold text-emerald-400 mb-2">
                30m
              </div>
              <div className="text-xl font-medium">
                approval time with Krishi Mitra
              </div>
            </div>
          </div>
        </div>

        {/* The Tech */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Built with Zero-Cost Sovereign AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TechCard
              icon={<Cpu className="w-8 h-8 text-indigo-500" />}
              title="Next.js & React"
              desc="A high-performance, accessible PWA that works on low-end devices."
            />
            <TechCard
              icon={<User className="w-8 h-8 text-emerald-500" />}
              title="Ultravox AI (70b)"
              desc="State-of-the-art multilingual voice model that understands Indian dialects."
            />
            <TechCard
              icon={<Heart className="w-8 h-8 text-rose-500" />}
              title="Open Source"
              desc="Built on a zero-cost stack to ensure sustainability and scalability."
            />
          </div>
        </div>

        {/* Team */}
        <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">The Team</h2>
          <div className="inline-flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-full border border-slate-200">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
              VG
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900">Vitthal Gund</div>
              <div className="text-sm text-slate-500">
                Developer & Architect, IIT Bombay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechCard({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="mb-4 bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-500">{desc}</p>
    </div>
  );
}
