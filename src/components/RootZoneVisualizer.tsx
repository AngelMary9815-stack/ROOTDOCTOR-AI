import { AlertTriangle, CheckCircle2, Droplets, FlaskConical, Thermometer, Zap } from 'lucide-react';
import type { RootZoneEvaluation, SensorReading } from '@/src/types/agro';

interface RootZoneVisualizerProps {
  reading: SensorReading;
  evaluation: RootZoneEvaluation;
  compact?: boolean;
}

export function RootZoneVisualizer({
  reading,
  evaluation,
  compact = false,
}: RootZoneVisualizerProps) {
  const moistureNorm = Math.min(1, Math.max(0, reading.moisture / 100));

  // Canopy leaf coloration responds to overall root-zone stress condition
  const leafColor =
    evaluation.overallCondition === 'Healthy'
      ? '#16A34A'
      : evaluation.overallCondition === 'Moderate'
      ? '#65A30D'
      : '#CA8A04';

  const leafHighlight =
    evaluation.overallCondition === 'Healthy'
      ? '#4ADE80'
      : evaluation.overallCondition === 'Moderate'
      ? '#A3E635'
      : '#FACC15';

  // Soil moisture tone
  const moistureOverlayColor =
    reading.moisture < 35
      ? 'rgba(217, 119, 6, 0.24)' // dry amber-tan
      : reading.moisture > 72
      ? 'rgba(2, 132, 199, 0.38)' // saturated deep cyan-blue
      : 'rgba(14, 165, 233, 0.24)'; // balanced hydration

  // pH rhizosphere halo
  const phHaloColor =
    reading.ph < 5.8
      ? 'rgba(234, 88, 12, 0.34)' // acidic orange-amber
      : reading.ph > 7.2
      ? 'rgba(79, 70, 229, 0.28)' // alkaline indigo
      : 'rgba(22, 163, 74, 0.22)'; // neutral emerald

  // Thermal tint
  const tempColor =
    reading.temperature > 30
      ? '#EA580C'
      : reading.temperature < 16
      ? '#0284C7'
      : '#16A34A';

  // EC ion density count (visual particles)
  const ionCount = Math.min(28, Math.max(4, Math.round(reading.ec * 7)));
  const ecColor =
    reading.ec > 2.6
      ? '#EF4444'
      : reading.ec < 1.0
      ? '#F59E0B'
      : '#34D399';

  const ionCoords = [
    [138, 228], [165, 245], [202, 236], [248, 250], [288, 230], [322, 248],
    [152, 272], [188, 285], [232, 275], [268, 290], [304, 272], [336, 288],
    [172, 310], [214, 304], [255, 318], [292, 306], [198, 336], [242, 342],
    [275, 332], [148, 296], [318, 298], [182, 260], [260, 262], [220, 292],
    [160, 326], [282, 322], [225, 355], [250, 232],
  ].slice(0, ionCount);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Interactive Cross-Section SVG Stage */}
        <div className="lg:col-span-8 rounded-xl border border-[#DCE6DF] bg-white overflow-hidden flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE6DF] px-4 py-3 bg-[#F7FAF8]">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Subsurface Root-Zone Cross-Section
              </h4>
              <p className="text-xs text-slate-600">
                Interactive strata response modeled from live sensor telemetry
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              {evaluation.overallCondition === 'Healthy' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle
                  className={`h-4 w-4 ${
                    evaluation.overallCondition === 'Critical'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}
                />
              )}
              <span>
                Root-Zone Condition:{' '}
                <strong
                  className={
                    evaluation.overallCondition === 'Healthy'
                      ? 'text-emerald-700'
                      : evaluation.overallCondition === 'Moderate'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }
                >
                  {evaluation.overallCondition}
                </strong>
              </span>
            </div>
          </div>

          <div className="relative w-full bg-gradient-to-b from-[#EDF6F0] via-[#F7FAF8] to-[#FFFFFF]">
            <svg
              viewBox="0 0 480 390"
              className={`w-full ${compact ? 'max-h-[340px]' : 'max-h-[430px]'} h-auto block`}
              role="img"
              aria-label={`Plant and underground root system visualization showing ${reading.moisture}% moisture, pH ${reading.ph}, ${reading.temperature} degrees Celsius, and ${reading.ec} mS/cm EC`}
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EFF7F2" />
                  <stop offset="100%" stopColor="#E1EFE6" />
                </linearGradient>
                <linearGradient id="topsoilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3E2B1E" />
                  <stop offset="100%" stopColor="#2C1D13" />
                </linearGradient>
                <linearGradient id="subsoilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F3827" />
                  <stop offset="100%" stopColor="#3B291C" />
                </linearGradient>
                <radialGradient id="phHaloGrad" cx="50%" cy="45%" r="50%">
                  <stop offset="0%" stopColor={phHaloColor} />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
              </defs>

              {/* Above-Ground Atmosphere */}
              <rect x="0" y="0" width="480" height="175" fill="url(#skyGrad)" />

              {/* Subtle depth ruler on left */}
              <line x1="26" y1="175" x2="26" y2="375" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
              <text x="32" y="190" fill="#E2E8F0" fontSize="9" fontFamily="JetBrains Mono, monospace">0 cm</text>
              <text x="32" y="268" fill="#CBD5E1" fontSize="9" fontFamily="JetBrains Mono, monospace">15 cm</text>
              <text x="32" y="362" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">35 cm</text>

              {/* Soil Strata */}
              <rect x="0" y="175" width="480" height="95" fill="url(#topsoilGrad)" />
              <rect x="0" y="270" width="480" height="120" fill="url(#subsoilGrad)" />
              <line x1="0" y1="175" x2="480" y2="175" stroke="#1E293B" strokeWidth="2" />
              <line x1="0" y1="270" x2="480" y2="270" stroke="#5C402C" strokeWidth="1" strokeDasharray="4 4" />

              {/* Dynamic Moisture Saturation Plume */}
              <ellipse
                cx="235"
                cy="255"
                rx={110 + moistureNorm * 65}
                ry={52 + moistureNorm * 35}
                fill={moistureOverlayColor}
                style={{ transition: 'all 300ms ease' }}
              />

              {/* Dynamic pH Rhizosphere Halo */}
              <ellipse
                cx="235"
                cy="255"
                rx="135"
                ry="85"
                fill="url(#phHaloGrad)"
              />

              {/* Soil Thermal Bar Indicator (Bottom Right Strata) */}
              <rect
                x="456"
                y="188"
                width="10"
                height="172"
                rx="5"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="1"
              />
              <rect
                x="458"
                y={356 - Math.min(164, Math.max(18, ((reading.temperature - 5) / 40) * 164))}
                width="6"
                height={Math.min(164, Math.max(18, ((reading.temperature - 5) / 40) * 164))}
                rx="3"
                fill={tempColor}
                style={{ transition: 'all 250ms ease' }}
              />
              <text
                x="448"
                y="184"
                textAnchor="end"
                fill="#F8FAFC"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                {reading.temperature.toFixed(1)}°C
              </text>

              {/* Above-Ground Plant Stem & Canopy */}
              <path
                d="M235 175 C235 142, 234 108, 235 66"
                stroke="#166534"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lateral Branches & Leaves */}
              <path
                d="M235 142 C215 130, 198 124, 184 118"
                stroke="#166534"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M184 118 C172 104, 152 108, 154 123 C165 131, 178 126, 184 118 Z"
                fill={leafColor}
              />
              <path
                d="M235 128 C258 115, 275 110, 290 104"
                stroke="#166534"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M290 104 C304 90, 324 95, 319 111 C308 119, 295 113, 290 104 Z"
                fill={leafColor}
              />
              <path
                d="M235 104 C216 90, 198 84, 182 78"
                stroke="#15803D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M182 78 C170 62, 148 68, 153 84 C164 92, 176 86, 182 78 Z"
                fill={leafHighlight}
              />
              <path
                d="M235 88 C255 76, 274 68, 288 60"
                stroke="#15803D"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M288 60 C302 46, 320 52, 316 68 C305 74, 294 68, 288 60 Z"
                fill={leafHighlight}
              />
              {/* Crown Leaves */}
              <path
                d="M235 66 C224 44, 236 28, 246 44 C248 55, 241 62, 235 66 Z"
                fill={leafColor}
              />
              <path
                d="M235 66 C214 50, 200 58, 212 72 C221 76, 230 71, 235 66 Z"
                fill={leafHighlight}
              />

              {/* Underground Branching Root Architecture */}
              <g stroke="#FDE68A" strokeLinecap="round" fill="none" opacity="0.92">
                {/* Primary Taproot */}
                <path d="M235 175 C234 210, 238 250, 232 308 C230 330, 233 348, 236 364" strokeWidth="4.2" />
                {/* Left Secondary Roots */}
                <path d="M234 196 C210 212, 178 218, 150 236" strokeWidth="2.8" />
                <path d="M186 218 C170 238, 152 256, 138 278" strokeWidth="1.8" />
                <path d="M235 228 C206 244, 185 268, 162 298" strokeWidth="2.4" />
                <path d="M190 264 C180 288, 178 312, 168 334" strokeWidth="1.5" />
                <path d="M234 268 C214 290, 202 315, 194 345" strokeWidth="1.9" />
                {/* Right Secondary Roots */}
                <path d="M236 202 C264 214, 294 226, 322 242" strokeWidth="2.8" />
                <path d="M282 224 C300 242, 316 264, 330 286" strokeWidth="1.8" />
                <path d="M236 238 C264 256, 286 282, 308 314" strokeWidth="2.3" />
                <path d="M276 276 C286 298, 294 322, 298 344" strokeWidth="1.5" />
                <path d="M234 282 C250 306, 260 328, 268 352" strokeWidth="1.8" />
                {/* Fine Root Hairs */}
                <path d="M168 230 C158 242, 148 246, 140 254" strokeWidth="1.1" opacity="0.7" />
                <path d="M300 235 C312 248, 324 254, 334 262" strokeWidth="1.1" opacity="0.7" />
                <path d="M214 304 C205 316, 198 326, 190 332" strokeWidth="1.1" opacity="0.7" />
                <path d="M256 306 C268 318, 276 328, 286 334" strokeWidth="1.1" opacity="0.7" />
              </g>

              {/* EC Dissolved Ion Particles in Pore Space */}
              {ionCoords.map(([cx, cy], idx) => (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="2.2"
                  fill={ecColor}
                  opacity="0.85"
                />
              ))}

              {/* Physical Probe 1: Capacitive Moisture Sensor (Left) */}
              <g transform="translate(106, 142)">
                <rect x="0" y="0" width="14" height="33" rx="2" fill="#0F172A" />
                <rect x="3" y="33" width="8" height="96" rx="2" fill="#1E293B" stroke="#FBBF24" strokeWidth="1" />
                <circle cx="7" cy="14" r="2.2" fill="#38BDF8" />
                <text x="-4" y="-6" fill="#0F172A" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  MOIST {reading.moisture.toFixed(0)}%
                </text>
              </g>

              {/* Physical Probe 2: Soil pH Probe (Inner Left) */}
              <g transform="translate(158, 134)">
                <rect x="0" y="0" width="12" height="41" rx="3" fill="#1D4ED8" />
                <rect x="2" y="41" width="8" height="108" rx="4" fill="#CBD5E1" opacity="0.9" />
                <circle cx="6" cy="149" r="4" fill="#93C5FD" />
                <text x="-8" y="-6" fill="#0F172A" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  pH {reading.ph.toFixed(1)}
                </text>
              </g>

              {/* Physical Probe 3: Soil EC Probe (Inner Right) */}
              <g transform="translate(310, 138)">
                <rect x="0" y="0" width="16" height="37" rx="3" fill="#0F172A" />
                <line x1="5" y1="37" x2="5" y2="140" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="11" y1="37" x2="11" y2="140" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                <text x="-6" y="-6" fill="#0F172A" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  EC {reading.ec.toFixed(2)}
                </text>
              </g>

              {/* Physical Probe 4: Waterproof DS18B20 Temp Probe (Right) */}
              <g transform="translate(362, 144)">
                <rect x="1" y="0" width="10" height="31" rx="2" fill="#334155" />
                <rect x="2" y="31" width="8" height="106" rx="4" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="0.8" />
                <text x="-8" y="-6" fill="#0F172A" fontSize="8.5" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  DS18B20
                </text>
              </g>

              {/* Strata Labels */}
              <text x="16" y="164" fill="#334155" fontSize="10" fontWeight="600">
                Soil Surface
              </text>
              <text x="16" y="260" fill="#E2E8F0" fontSize="10" fontWeight="500">
                Primary Root Zone
              </text>
              <text x="16" y="355" fill="#CBD5E1" fontSize="10" fontWeight="500">
                Deep Subsoil
              </text>
            </svg>
          </div>
        </div>

        {/* Live Root-Zone Condition Readout Matrix */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          <div className="rounded-xl border border-[#DCE6DF] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Droplets className="h-4 w-4 text-sky-600" />
                <span>Moisture Distribution</span>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {reading.moisture.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  evaluation.moisture.severity === 'nominal'
                    ? 'bg-emerald-600'
                    : evaluation.moisture.severity === 'advisory'
                    ? 'bg-amber-500'
                    : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(4, reading.moisture))}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{evaluation.moisture.status}:</span>{' '}
              {evaluation.moisture.detail}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FlaskConical className="h-4 w-4 text-emerald-700" />
                <span>pH Condition</span>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                pH {reading.ph.toFixed(2)}
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-indigo-600">
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-2 rounded-sm bg-slate-950 border border-white transition-all duration-300"
                style={{
                  left: `calc(${Math.min(98, Math.max(2, ((reading.ph - 3.5) / 6.0) * 100))}% - 4px)`,
                }}
              />
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{evaluation.ph.status}:</span>{' '}
              {evaluation.ph.detail}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Thermometer className="h-4 w-4 text-orange-600" />
                <span>Root-Zone Temperature</span>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {reading.temperature.toFixed(1)} °C
              </span>
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{evaluation.temperature.status}:</span>{' '}
              {evaluation.temperature.detail}
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE6DF] bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Zap className="h-4 w-4 text-amber-600" />
                <span>EC / Ion Density</span>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                {reading.ec.toFixed(2)} mS/cm
              </span>
            </div>
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{evaluation.ec.status}:</span>{' '}
              {evaluation.ec.detail}
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Scientific Disclaimer */}
      <p className="text-xs text-slate-500 border-t border-[#DCE6DF] pt-3">
        Note: This subsurface visualization models measured soil moisture, pH, electrical conductivity, and thermal state around the monitored root zone. It does not claim to diagnose biological root diseases from sensor measurements alone.
      </p>
    </div>
  );
}
