import { useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Pause,
  Play,
  Radio,
  RotateCcw,
  SlidersHorizontal,
  Thermometer,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RootZoneVisualizer } from '@/src/components/RootZoneVisualizer';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Slider } from '@/src/components/ui/slider';
import { PRESET_SIMULATIONS } from '@/src/lib/agroEngine';
import type {
  AIAnalysisReport,
  AlertSeverity,
  OperationMode,
  PageId,
  RootZoneAlert,
  RootZoneEvaluation,
  SensorReading,
  SensorThresholds,
} from '@/src/types/agro';

interface DashboardPageProps {
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  rawReading: SensorReading;
  currentReading: SensorReading;
  history: SensorReading[];
  thresholds: SensorThresholds;
  evaluation: RootZoneEvaluation;
  alerts: RootZoneAlert[];
  dismissedAlertIds: string[];
  onDismissAlert: (id: string) => void;
  analysis: AIAnalysisReport;
  onUpdateSensor: (key: 'moisture' | 'ph' | 'temperature' | 'ec', value: number) => void;
  onApplyPreset: (preset: 'healthy' | 'lowMoisture' | 'abnormalPh') => void;
  onNavigate: (page: PageId) => void;
  liveEndpointConfigured: boolean;
}

function getSeverityStyle(severity: AlertSeverity) {
  switch (severity) {
    case 'nominal':
      return {
        border: 'border-emerald-200 bg-emerald-50/70',
        text: 'text-emerald-800',
        badge: 'text-emerald-700',
        dot: 'bg-emerald-600',
        label: 'Healthy / Nominal',
        Icon: CheckCircle2,
      };
    case 'advisory':
      return {
        border: 'border-yellow-300 bg-yellow-50/80',
        text: 'text-yellow-900',
        badge: 'text-yellow-800',
        dot: 'bg-yellow-500',
        label: 'Yellow Advisory',
        Icon: AlertCircle,
      };
    case 'warning':
      return {
        border: 'border-orange-300 bg-orange-50/85',
        text: 'text-orange-900',
        badge: 'text-orange-700',
        dot: 'bg-orange-500',
        label: 'Orange Warning',
        Icon: AlertTriangle,
      };
    case 'critical':
      return {
        border: 'border-red-300 bg-red-50/90',
        text: 'text-red-900',
        badge: 'text-red-700',
        dot: 'bg-red-600',
        label: 'Red Critical',
        Icon: AlertTriangle,
      };
  }
}

export function DashboardPage({
  mode,
  onModeChange,
  isStreaming,
  onToggleStreaming,
  rawReading,
  currentReading,
  history,
  thresholds,
  evaluation,
  alerts,
  dismissedAlertIds,
  onDismissAlert,
  analysis,
  onUpdateSensor,
  onApplyPreset,
  onNavigate,
  liveEndpointConfigured,
}: DashboardPageProps) {
  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !dismissedAlertIds.includes(a.id)),
    [alerts, dismissedAlertIds]
  );

  const conditionColor =
    evaluation.overallCondition === 'Healthy'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : evaluation.overallCondition === 'Moderate'
      ? 'text-amber-800 bg-amber-50 border-amber-200'
      : 'text-red-700 bg-red-50 border-red-200';

  const scoreStrokeColor =
    evaluation.healthScore >= 78
      ? '#15803D'
      : evaluation.healthScore >= 50
      ? '#D97706'
      : '#DC2626';

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (evaluation.healthScore / 100) * circumference;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Mode & Telemetry Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#DCE6DF] bg-white p-4 sm:px-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Live Root-Zone Monitoring Dashboard
            </h1>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <span
                className={`h-2 w-2 rounded-full ${
                  mode === 'demo'
                    ? isStreaming
                      ? 'bg-emerald-600'
                      : 'bg-amber-500'
                    : liveEndpointConfigured
                    ? 'bg-sky-600'
                    : 'bg-slate-400'
                }`}
              />
              {mode === 'demo'
                ? isStreaming
                  ? 'DEMO MODE · Simulated Telemetry Active'
                  : 'DEMO MODE · Simulation Paused'
                : liveEndpointConfigured
                ? 'LIVE DEVICE MODE · Polling ESP32 Endpoint'
                : 'LIVE DEVICE MODE · Awaiting ESP32 Stream'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {mode === 'demo'
              ? 'Displaying simulated root-zone readings for presentation and threshold testing. Not live field hardware data.'
              : 'Live ESP32 integration channel selected. Configure REST/MQTT endpoint in Settings to receive real hardware packets.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Demo Mode vs Live Device Mode Segmented Switch */}
          <div
            className="inline-flex items-center rounded-lg bg-[#EEF5F0] p-1 border border-[#DCE6DF]"
            role="group"
            aria-label="Telemetry Source Mode"
          >
            <button
              type="button"
              onClick={() => onModeChange('demo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'demo'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Mode
            </button>
            <button
              type="button"
              onClick={() => onModeChange('live')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'live'
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Device Mode
            </button>
          </div>

          {mode === 'demo' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStreaming}
            >
              {isStreaming ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Drift</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume Drift</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('settings')}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Configure ESP32</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Device Mode Banner when waiting for hardware */}
      {mode === 'live' && !liveEndpointConfigured && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Radio className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-950">
                No Active ESP32 Endpoint Connected
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Live Device Mode does not fabricate hardware data. Enter an ESP32 REST/MQTT endpoint in Settings or switch back to Demo Mode to test interactive simulations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => onModeChange('demo')}>
              Switch to Demo Mode
            </Button>
            <Button size="sm" onClick={() => onNavigate('settings')}>
              Open Settings
            </Button>
          </div>
        </div>
      )}

      {/* Top Row: Root-Zone Health Score + Live Sensor Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Overall Root-Zone Health Score (0-100) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Root-Zone Health Score</CardTitle>
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${conditionColor}`}
              >
                {evaluation.overallCondition === 'Healthy' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                <span>{evaluation.overallCondition}</span>
              </span>
            </div>
            <CardDescription>
              Composite index weighted across moisture, pH, EC, and soil temperature
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#E2EAE5"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={scoreStrokeColor}
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 350ms ease, stroke 250ms ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                    {evaluation.healthScore}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">out of 100</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 text-xs">
                {[
                  { label: 'Moisture', score: evaluation.moisture.score, status: evaluation.moisture.status },
                  { label: 'Soil pH', score: evaluation.ph.score, status: evaluation.ph.status },
                  { label: 'Conductivity (EC)', score: evaluation.ec.score, status: evaluation.ec.status },
                  { label: 'Temperature', score: evaluation.temperature.score, status: evaluation.temperature.status },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-mono tabular-nums text-slate-600">
                        {item.score}/100 · {item.status}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.score >= 78
                            ? 'bg-emerald-600'
                            : item.score >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE6DF] flex items-center justify-between text-xs text-slate-500">
              <span>Last Sample: {currentReading.label}</span>
              <button
                type="button"
                onClick={() => onNavigate('root-zone')}
                className="font-semibold text-[#14532D] hover:underline cursor-pointer"
              >
                Inspect Underground Roots
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Live Sensor Simulation Controls */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#14532D]" />
                <CardTitle>Live Sensor Simulation</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApplyPreset('healthy')}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Healthy</span>
              </Button>
            </div>
            <CardDescription>
              Adjust sliders or trigger scenario presets to immediately update telemetry graphs, health score, AI analysis, and alerts.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Three Required Preset Simulation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onApplyPreset('healthy')}
                className="justify-start text-left h-auto py-2.5 px-3 whitespace-normal"
              >
                {PRESET_SIMULATIONS.healthy.label}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyPreset('lowMoisture')}
                className="justify-start text-left h-auto py-2.5 px-3 border-amber-300 text-amber-900 hover:bg-amber-50 whitespace-normal"
              >
                {PRESET_SIMULATIONS.lowMoisture.label}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyPreset('abnormalPh')}
                className="justify-start text-left h-auto py-2.5 px-3 border-red-300 text-red-900 hover:bg-red-50 whitespace-normal"
              >
                {PRESET_SIMULATIONS.abnormalPh.label}
              </Button>
            </div>

            {/* 4 Interactive Sensor Sliders + Numeric Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-1">
              {/* Moisture Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="sim-moisture" className="text-xs font-semibold text-slate-800">
                    Soil Moisture Sensor (%)
                  </label>
                  <Input
                    id="sim-moisture"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={rawReading.moisture}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) onUpdateSensor('moisture', Math.min(100, Math.max(0, v)));
                    }}
                    className="h-7 w-20 px-2 text-right font-mono text-xs tabular-nums"
                  />
                </div>
                <Slider
                  value={[rawReading.moisture]}
                  min={5}
                  max={95}
                  step={0.5}
                  aria-label="Soil Moisture Percentage"
                  onValueChange={([v]) => onUpdateSensor('moisture', v)}
                />
              </div>

              {/* pH Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="sim-ph" className="text-xs font-semibold text-slate-800">
                    Soil pH Sensor (pH)
                  </label>
                  <Input
                    id="sim-ph"
                    type="number"
                    min={3.5}
                    max={9.5}
                    step={0.1}
                    value={rawReading.ph}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) onUpdateSensor('ph', Math.min(9.5, Math.max(3.5, v)));
                    }}
                    className="h-7 w-20 px-2 text-right font-mono text-xs tabular-nums"
                  />
                </div>
                <Slider
                  value={[rawReading.ph]}
                  min={3.5}
                  max={9.5}
                  step={0.05}
                  aria-label="Soil pH Level"
                  onValueChange={([v]) => onUpdateSensor('ph', v)}
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="sim-temp" className="text-xs font-semibold text-slate-800">
                    Soil Temperature Sensor (°C)
                  </label>
                  <Input
                    id="sim-temp"
                    type="number"
                    min={5}
                    max={45}
                    step={0.5}
                    value={rawReading.temperature}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) onUpdateSensor('temperature', Math.min(45, Math.max(5, v)));
                    }}
                    className="h-7 w-20 px-2 text-right font-mono text-xs tabular-nums"
                  />
                </div>
                <Slider
                  value={[rawReading.temperature]}
                  min={5}
                  max={45}
                  step={0.2}
                  aria-label="Soil Temperature Celsius"
                  onValueChange={([v]) => onUpdateSensor('temperature', v)}
                />
              </div>

              {/* EC Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="sim-ec" className="text-xs font-semibold text-slate-800">
                    Soil EC Sensor (mS/cm)
                  </label>
                  <Input
                    id="sim-ec"
                    type="number"
                    min={0.1}
                    max={5.0}
                    step={0.05}
                    value={rawReading.ec}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) onUpdateSensor('ec', Math.min(5.0, Math.max(0.1, v)));
                    }}
                    className="h-7 w-20 px-2 text-right font-mono text-xs tabular-nums"
                  />
                </div>
                <Slider
                  value={[rawReading.ec]}
                  min={0.2}
                  max={4.5}
                  step={0.05}
                  aria-label="Soil Electrical Conductivity"
                  onValueChange={([v]) => onUpdateSensor('ec', v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4 Sensor Telemetry Cards + Real-Time Recharts Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. SOIL MOISTURE */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Droplets className="h-4 w-4 text-sky-600" />
                  <span>Soil Moisture</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                    {currentReading.moisture.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs uppercase text-slate-500">% VWC</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    getSeverityStyle(evaluation.moisture.severity).border
                  } ${getSeverityStyle(evaluation.moisture.severity).text}`}
                >
                  {evaluation.moisture.status}
                </span>
                <p className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums">
                  Target: {thresholds.moistureMin}–{thresholds.moistureMax}%
                </p>
              </div>
            </div>

            {/* Animated Moisture Indicator */}
            <div className="mt-3 space-y-1">
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    evaluation.moisture.severity === 'nominal'
                      ? 'bg-emerald-600'
                      : evaluation.moisture.severity === 'advisory'
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, currentReading.moisture))}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">{evaluation.moisture.detail}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={18} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: '#DCE6DF',
                    }}
                  />
                  <ReferenceLine y={thresholds.moistureMin} stroke="#D97706" strokeDasharray="4 4" />
                  <ReferenceLine y={thresholds.moistureMax} stroke="#0284C7" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="moisture"
                    name="Moisture (%)"
                    stroke="#0284C7"
                    strokeWidth={2}
                    fill="url(#moistureFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. SOIL pH */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <FlaskConical className="h-4 w-4 text-emerald-700" />
                  <span>Soil pH</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                    {currentReading.ph.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs uppercase text-slate-500">pH</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    getSeverityStyle(evaluation.ph.severity).border
                  } ${getSeverityStyle(evaluation.ph.severity).text}`}
                >
                  {evaluation.ph.status}
                </span>
                <p className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums">
                  Target: {thresholds.phMin.toFixed(1)}–{thresholds.phMax.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Colour-Coded pH Spectrum Indicator */}
            <div className="mt-3 space-y-1">
              <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-indigo-600">
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-2 rounded-sm bg-slate-950 border border-white transition-all duration-300"
                  style={{
                    left: `calc(${Math.min(98, Math.max(2, ((currentReading.ph - 3.5) / 6.0) * 100))}% - 4px)`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-600">{evaluation.ph.detail}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={18} />
                  <YAxis domain={[3.5, 9.5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: '#DCE6DF',
                    }}
                  />
                  <ReferenceLine y={thresholds.phMin} stroke="#EA580C" strokeDasharray="4 4" />
                  <ReferenceLine y={thresholds.phMax} stroke="#4F46E5" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="ph"
                    name="Soil pH"
                    stroke="#15803D"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#14532D' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 3. SOIL TEMPERATURE */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <span>Soil Temperature</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                    {currentReading.temperature.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs uppercase text-slate-500">°C</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    getSeverityStyle(evaluation.temperature.severity).border
                  } ${getSeverityStyle(evaluation.temperature.severity).text}`}
                >
                  {evaluation.temperature.status}
                </span>
                <p className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums">
                  Target: {thresholds.tempMin}–{thresholds.tempMax} °C
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600">{evaluation.temperature.detail}</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={18} />
                  <YAxis domain={[5, 45]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: '#DCE6DF',
                    }}
                  />
                  <ReferenceLine y={thresholds.tempMax} stroke="#DC2626" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#EA580C"
                    strokeWidth={2}
                    fill="url(#tempFill)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 4. SOIL ELECTRICAL CONDUCTIVITY (EC) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span>Soil Electrical Conductivity (EC)</span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold tabular-nums text-slate-900">
                    {currentReading.ec.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs uppercase text-slate-500">mS/cm</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    getSeverityStyle(evaluation.ec.severity).border
                  } ${getSeverityStyle(evaluation.ec.severity).text}`}
                >
                  {evaluation.ec.status}
                </span>
                <p className="mt-1 text-[11px] font-mono text-slate-500 tabular-nums">
                  Target: {thresholds.ecMin.toFixed(1)}–{thresholds.ecMax.toFixed(1)} mS/cm
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600">{evaluation.ec.detail}</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={18} />
                  <YAxis domain={[0, 4.5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: '#DCE6DF',
                    }}
                  />
                  <ReferenceLine y={thresholds.ecMin} stroke="#D97706" strokeDasharray="4 4" />
                  <ReferenceLine y={thresholds.ecMax} stroke="#DC2626" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="ec"
                    name="EC (mS/cm)"
                    stroke="#D97706"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#B45309' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Root-Zone Analysis + Alert Notification System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI Root-Zone Analysis */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-[#14532D]" />
                <CardTitle>AI Root-Zone Analysis</CardTitle>
              </div>
              <span className="text-xs font-medium text-slate-600">
                {analysis.confidenceLabel}
              </span>
            </div>
            <CardDescription className="pt-1">
              Examines all four soil sensor parameters and short-term shifts to classify plant root-zone condition.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-5">
            {/* Classification Summary */}
            <div className={`rounded-xl border p-4 ${conditionColor}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Classified Condition: {analysis.classification}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  Health Score {evaluation.healthScore}/100
                </span>
              </div>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Abnormal Sensor Readings & Trend Observations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#DCE6DF] bg-[#F7FAF8] p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Abnormal Readings Detected
                </h4>
                {analysis.abnormalReadings.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed list-disc pl-4">
                    {analysis.abnormalReadings.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    No abnormal sensor thresholds violated.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-[#DCE6DF] bg-[#F7FAF8] p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Change &amp; Trend Detection
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed list-disc pl-4">
                  {analysis.trendObservations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Irrigation Requirements & pH/EC Assessment */}
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-[#DCE6DF] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[#14532D] mb-1">
                  Irrigation Requirement Guidance
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {analysis.irrigationRequirement}
                </p>
              </div>
              <div className="rounded-lg border border-[#DCE6DF] p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-[#14532D] mb-1">
                  Soil pH &amp; EC Nutrient Diagnostic
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {analysis.phAndEcAssessment}
                </p>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Recommended Management Actions
              </h4>
              <ul className="space-y-1.5">
                {analysis.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#15803D] mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-500 border-t border-[#DCE6DF] pt-3">
              {analysis.disclaimer}
            </p>
          </CardContent>
        </Card>

        {/* Alert and Notification System */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Alert &amp; Notification Panel</CardTitle>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                {alerts.filter((a) => a.severity !== 'nominal').length} active
              </span>
            </div>
            <CardDescription>
              Real-time threshold alerts using green, yellow, orange, and red severity states.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-3">
            {/* Severity Color Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 pb-2 border-b border-[#DCE6DF]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                <span>Green: Nominal</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span>Yellow: Advisory</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span>Orange: Warning</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                <span>Red: Critical</span>
              </span>
            </div>

            {visibleAlerts.length === 0 ? (
              <div className="rounded-lg border border-[#DCE6DF] bg-[#F7FAF8] p-4 text-center text-xs text-slate-600">
                All active notifications dismissed for this sample window.
              </div>
            ) : (
              visibleAlerts.map((alert) => {
                const style = getSeverityStyle(alert.severity);
                const Icon = style.Icon;
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 space-y-2 ${style.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 shrink-0 ${style.badge}`} />
                        <span className={`font-mono text-xs font-bold ${style.badge}`}>
                          {alert.code}
                        </span>
                      </div>
                      <span className={`text-[11px] font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-snug ${style.text}`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                      <span className="font-mono tabular-nums">{alert.valueLabel}</span>
                      {alert.severity !== 'nominal' && (
                        <button
                          type="button"
                          onClick={() => onDismissAlert(alert.id)}
                          className="font-semibold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onNavigate('settings')}
              >
                Adjust Alert Thresholds in Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Underground Root Visualization Section */}
      <Card>
        <CardHeader className="pb-3 border-b border-[#DCE6DF]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Underground Root-Zone Response</CardTitle>
              <CardDescription>
                Live subsurface moisture plume, pH rhizosphere halo, EC ion density, and thermal bar synced to dashboard controls.
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('root-zone')}
            >
              Open Full Root Explorer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <RootZoneVisualizer reading={currentReading} evaluation={evaluation} compact />
        </CardContent>
      </Card>
    </div>
  );
}
