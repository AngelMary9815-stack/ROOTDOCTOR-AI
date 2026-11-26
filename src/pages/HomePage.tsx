import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Droplets,
  FlaskConical,
  Layers,
  Sprout,
  Thermometer,
  Wifi,
  Zap,
} from 'lucide-react';
import { AgroLogoMark } from '@/src/components/AgroLogo';
import { SystemArchitectureDiagram } from '@/src/components/SystemArchitectureDiagram';
import { Button } from '@/src/components/ui/button';
import { HERO_PLANT_IMAGE } from '@/src/data/hardwareCatalog';
import type { PageId, RootZoneEvaluation, SensorReading } from '@/src/types/agro';

interface HomePageProps {
  currentReading: SensorReading;
  evaluation: RootZoneEvaluation;
  onNavigate: (page: PageId) => void;
}

export function HomePage({
  currentReading,
  evaluation,
  onNavigate,
}: HomePageProps) {
  const [heroImgError, setHeroImgError] = useState(false);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Proposition & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#DCE6DF] bg-white p-6 sm:p-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <AgroLogoMark className="h-9 w-9 shrink-0" />
                <div className="text-xs font-medium text-slate-600 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#14532D]">AgroRoot AI</span>
                  <span aria-hidden="true">·</span>
                  <span>ESP32 IoT Root-Zone Telemetry</span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance]">
                  Smart Monitoring. Early Detection. Better Agriculture.
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                  AgroRoot AI is an intelligent root-zone monitoring platform that
                  tracks underground soil moisture, pH, electrical conductivity
                  (EC), and temperature using multi-probe IoT sensors connected to
                  an ESP32 microcontroller over Wi-Fi.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#DCE6DF] space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => onNavigate('dashboard')}
                >
                  <span>Explore Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToHowItWorks}
                >
                  How It Works
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>4 Underground Soil Probes</span>
                <span aria-hidden="true">·</span>
                <span>ESP32 Wi-Fi Node</span>
                <span aria-hidden="true">·</span>
                <span>Interactive Demo Simulation</span>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic 3D Plant with Visible Underground Roots & Sensors */}
          <div className="lg:col-span-6 rounded-2xl border border-[#DCE6DF] bg-white overflow-hidden flex flex-col">
            <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] bg-[#EEF5F0]">
              {!heroImgError ? (
                <img
                  src={HERO_PLANT_IMAGE}
                  alt="3D cross-section of a thriving crop plant showing underground root networks and four IoT soil sensors measuring moisture, pH, EC, and temperature"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#EEF5F0] to-[#DCECE1]">
                  <Sprout className="h-14 w-14 text-[#14532D] mb-3" />
                  <p className="text-sm font-semibold text-slate-900">
                    3D Subsurface Root-Zone Sensor Array
                  </p>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm">
                    Moisture, pH, EC, and DS18B20 temperature probes embedded along active crop roots.
                  </p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-200">
                      Multi-Depth Root-Zone Array
                    </p>
                    <p className="text-sm font-semibold">
                      Direct subsurface sensing before foliar symptoms appear
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('root-zone')}
                    className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#14532D] hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open Root Visualizer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Live Telemetry Snapshot Strip */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#DCE6DF] bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Soil Moisture</span>
              <Droplets className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {currentReading.moisture.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {evaluation.moisture.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Capacitive dielectric probe</p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Soil pH</span>
              <FlaskConical className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {currentReading.ph.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {evaluation.ph.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Glass-bulb BNC electrode</p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Soil Temperature</span>
              <Thermometer className="h-4 w-4 text-orange-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {currentReading.temperature.toFixed(1)} °C
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {evaluation.temperature.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Waterproof DS18B20 1-Wire</p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Electrical Conductivity</span>
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {currentReading.ec.toFixed(2)} mS/cm
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {evaluation.ec.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Dual-electrode salinity probe</p>
          </div>
        </div>
      </section>

      {/* Project Advantages & Innovation Highlights (Asymmetric Bento) */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            01. Engineering Innovation Highlights
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unified subsurface telemetry replaces guesswork with continuous, multi-parameter root-zone diagnostics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-7 rounded-xl border border-[#DCE6DF] bg-white p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                <Layers className="h-4 w-4" />
                <span>Multi-Sensor Root-Zone Fusion</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Four complementary physical and chemical metrics in one compact node
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Measuring moisture alone overlooks salt buildup or nutrient-locking pH shifts. AgroRoot AI correlates moisture, pH, electrical conductivity, and soil temperature simultaneously to compute a unified 0–100 Root-Zone Health Score.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DCE6DF] flex flex-wrap gap-4 text-xs text-slate-600">
              <span>0–100 Health Scoring</span>
              <span aria-hidden="true">·</span>
              <span>Simulated AI Irrigation Guidance</span>
              <span aria-hidden="true">·</span>
              <span>Configurable Alert Thresholds</span>
            </div>
          </div>

          <div className="md:col-span-5 rounded-xl border border-[#DCE6DF] bg-[#14532D] text-white p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
                <Cpu className="h-4 w-4" />
                <span>ESP32 Edge-to-Cloud Architecture</span>
              </div>
              <h3 className="text-xl font-semibold text-white">
                Hardware-ready REST &amp; MQTT telemetry pipeline
              </h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Runs safely in Demo Mode for engineering reviews while keeping payload schemas, calibration offsets, and endpoint bindings ready for live ESP32 field hardware.
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => onNavigate('hardware')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-200 transition-colors cursor-pointer"
              >
                <span>Inspect 10 Hardware Components</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="md:col-span-4 rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
              <Wifi className="h-4 w-4" />
              <span>Early Warning Alerts</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Pre-symptomatic stress detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Detects moisture deficits, acidic/alkaline drift, thermal spikes, and salinity stress days before leaf wilting becomes visible.
            </p>
          </div>

          <div className="md:col-span-4 rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
              <Droplets className="h-4 w-4" />
              <span>Precision Water Savings</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Targeted irrigation decisions
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Prevents over-watering and root hypoxia by pairing real-time volumetric moisture bands with simulated AI drip-cycle recommendations.
            </p>
          </div>

          <div className="md:col-span-4 rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
              <Sprout className="h-4 w-4" />
              <span>CSV Reports &amp; Trends</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Daily, weekly, and monthly analytics
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Historical charts and one-click CSV exports support academic validation, agronomic audits, and seasonal soil comparisons.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works: Animated System Architecture */}
      <section
        id="how-it-works"
        className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              02. How It Works — System Architecture
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Click any stage in the animated data pipeline to inspect communication protocols, latency, and sample telemetry frames.
            </p>
          </div>
          <Button variant="secondary" onClick={() => onNavigate('hardware')}>
            View Full Hardware &amp; Pinouts
          </Button>
        </div>

        <SystemArchitectureDiagram />
      </section>

      {/* Final Project Presentation Section */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            03. Project Presentation Summary
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Engineering innovation overview prepared for academic faculty, innovation challenge judges, and technical evaluators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-3">
            <span className="font-mono text-xs font-semibold text-[#15803D]">
              PROJECT INNOVATION
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Unified Intelligent Root-Zone Platform
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Combining multiple underground soil parameters—moisture, pH, electrical conductivity, and temperature—into one intelligent root-zone monitoring platform with live visual feedback and predictive guidance.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-3">
            <span className="font-mono text-xs font-semibold text-amber-700">
              PROBLEM STATEMENT
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Delayed Detection of Subsurface Stress
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Farmers often identify soil-related plant stress—such as moisture depletion, nutrient-locking acidity, or excess salinity—only after visible leaf wilting or yellowing symptoms appear above ground.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-6 space-y-3">
            <span className="font-mono text-xs font-semibold text-[#15803D]">
              PROPOSED SOLUTION
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Continuous IoT + ESP32 + AI-Assisted Analysis
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Continuous subsurface monitoring using calibrated soil sensors, ESP32 Wi-Fi data transmission, real-time threshold alerts, and AI-assisted soil interpretation before crop yield is impacted.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#DCE6DF] bg-white p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-display text-xl font-bold text-slate-900">
              Expected Agricultural &amp; Engineering Benefits
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
              {[
                'Early identification of abnormal soil conditions',
                'Better, evidence-based irrigation decisions',
                'Continuous 24/7 root-zone monitoring',
                'Reduced unnecessary agricultural water usage',
                'Data-driven soil and nutrient management',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D] mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#EEF5F0] border border-[#CFE0D4] p-6 space-y-4">
            <p className="font-display text-lg font-bold text-[#14532D] leading-snug">
              &ldquo;AgroRoot AI – Understanding Plant Health from the Roots Up.&rdquo;
            </p>
            <p className="text-xs text-slate-600">
              Launch the interactive monitoring dashboard to test live sensor simulations, preset stress scenarios, AI analysis, and threshold alerts.
            </p>
            <Button onClick={() => onNavigate('dashboard')} className="w-full sm:w-auto">
              <span>Launch Interactive Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
