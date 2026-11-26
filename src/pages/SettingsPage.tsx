import { useState } from 'react';
import { CheckCircle2, Cpu, Radio, RotateCcw, Wifi } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Switch } from '@/src/components/ui/switch';
import { DEFAULT_CALIBRATION, DEFAULT_THRESHOLDS } from '@/src/lib/agroEngine';
import type {
  DeviceConfig,
  OperationMode,
  SensorCalibration,
  SensorReading,
  SensorThresholds,
} from '@/src/types/agro';

interface SettingsPageProps {
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  thresholds: SensorThresholds;
  onUpdateThresholds: (next: SensorThresholds) => void;
  calibration: SensorCalibration;
  onUpdateCalibration: (next: SensorCalibration) => void;
  deviceConfig: DeviceConfig;
  onUpdateDeviceConfig: (next: DeviceConfig) => void;
  currentReading: SensorReading;
  liveProbeResult: string | null;
  onTestLiveEndpoint: () => void;
}

export function SettingsPage({
  mode,
  onModeChange,
  thresholds,
  onUpdateThresholds,
  calibration,
  onUpdateCalibration,
  deviceConfig,
  onUpdateDeviceConfig,
  currentReading,
  liveProbeResult,
  onTestLiveEndpoint,
}: SettingsPageProps) {
  const [savedToast, setSavedToast] = useState(false);

  const flashSaved = () => {
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2500);
  };

  const sampleEsp32Payload = JSON.stringify(
    {
      deviceId: deviceConfig.deviceId,
      mode: mode === 'demo' ? 'SIMULATED_DEMO' : 'ESP32_LIVE',
      firmware: deviceConfig.firmwareVersion,
      wifiRssiDbm: deviceConfig.wifiRssiDbm,
      sensors: {
        soilMoisturePct: currentReading.moisture,
        soilPh: currentReading.ph,
        soilTempC: currentReading.temperature,
        soilEcMsCm: currentReading.ec,
      },
      timestamp: currentReading.timestamp,
    },
    null,
    2
  );

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            System Settings &amp; ESP32 Integration
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Configure sensor calibration, adjustable alert thresholds, Demo vs Live Device telemetry mode, and ESP32 Wi-Fi / MQTT / REST connectivity parameters.
          </p>
        </div>

        {savedToast && (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span>Configuration Applied</span>
          </div>
        )}
      </div>

      {/* Operation Mode & Device Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-6">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#14532D]" />
              <CardTitle>Telemetry Operation Mode</CardTitle>
            </div>
            <CardDescription>
              Clearly separates presentation simulation data from physical ESP32 hardware streams.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onModeChange('demo');
                  flashSaved();
                }}
                className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                  mode === 'demo'
                    ? 'border-[#14532D] bg-[#EEF5F0]'
                    : 'border-[#DCE6DF] bg-white hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  Demo Mode (Simulated)
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Interactive client-side sensor simulation and preset conditions for project evaluations.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onModeChange('live');
                  flashSaved();
                }}
                className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                  mode === 'live'
                    ? 'border-[#14532D] bg-[#EEF5F0]'
                    : 'border-[#DCE6DF] bg-white hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  Live Device Mode (ESP32)
                </div>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Polls configured ESP32 REST/MQTT telemetry endpoint. Never fakes live hardware data.
                </p>
              </button>
            </div>

            {/* ESP32 & Wi-Fi Connectivity Status */}
            <div className="rounded-xl border border-[#DCE6DF] bg-[#F7FAF8] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  <Wifi className="h-4 w-4 text-[#15803D]" />
                  <span>ESP32 &amp; Wi-Fi Connectivity Status</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {mode === 'demo'
                    ? 'Simulated Hardware Profile'
                    : deviceConfig.apiEndpoint.trim()
                    ? 'Endpoint Configured'
                    : 'Disconnected'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Device ID</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">
                    {deviceConfig.deviceId}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">ESP32 Link State</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">
                    {mode === 'demo' ? 'Virtual Node Ready' : 'Awaiting Live Packet'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Wi-Fi SSID</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5">
                    {deviceConfig.wifiSsid}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Signal Strength (RSSI)</span>
                  <p className="font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {deviceConfig.wifiRssiDbm} dBm (Good)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future ESP32 API / MQTT Integration */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#14532D]" />
              <CardTitle>ESP32 REST API &amp; MQTT Readiness</CardTitle>
            </div>
            <CardDescription>
              Architecture ready for physical ESP32 Wi-Fi telemetry ingestion via JSON over HTTP or MQTT.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="esp-endpoint" className="text-xs font-semibold text-slate-700">
                  ESP32 Telemetry REST Endpoint (GET JSON)
                </label>
                <Input
                  id="esp-endpoint"
                  type="url"
                  placeholder="https://your-esp32-gateway/api/telemetry"
                  value={deviceConfig.apiEndpoint}
                  onChange={(e) =>
                    onUpdateDeviceConfig({ ...deviceConfig, apiEndpoint: e.target.value })
                  }
                  className="text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mqtt-broker" className="text-xs font-semibold text-slate-700">
                  MQTT Broker URI &amp; Topic
                </label>
                <Input
                  id="mqtt-broker"
                  type="text"
                  value={`${deviceConfig.mqttBroker} · ${deviceConfig.mqttTopic}`}
                  onChange={(e) => {
                    const [broker, topic] = e.target.value.split('·').map((s) => s.trim());
                    onUpdateDeviceConfig({
                      ...deviceConfig,
                      mqttBroker: broker ?? '',
                      mqttTopic: topic ?? deviceConfig.mqttTopic,
                    });
                  }}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={onTestLiveEndpoint}>
                Test Live Endpoint Connection
              </Button>
              {liveProbeResult && (
                <span className="text-xs text-slate-700">{liveProbeResult}</span>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] text-slate-400 mb-1">
                Expected ESP32 JSON Telemetry Contract
              </div>
              <pre className="leading-relaxed">{sampleEsp32Payload}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adjustable Alert Thresholds + Sensor Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Adjustable Alert Thresholds */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Adjustable Alert Thresholds</CardTitle>
                <CardDescription>
                  Changes immediately recalculate the Dashboard Health Score, AI Analysis, and Alerts.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onUpdateThresholds(DEFAULT_THRESHOLDS);
                  flashSaved();
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Moisture Bounds */}
            <div className="rounded-lg border border-[#DCE6DF] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Soil Moisture (%)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="th-m-min" className="text-xs text-slate-600">Min (%)</label>
                  <Input
                    id="th-m-min"
                    type="number"
                    value={thresholds.moistureMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, moistureMin: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="th-m-max" className="text-xs text-slate-600">Max (%)</label>
                  <Input
                    id="th-m-max"
                    type="number"
                    value={thresholds.moistureMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, moistureMax: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* pH Bounds */}
            <div className="rounded-lg border border-[#DCE6DF] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Soil pH Range</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="th-ph-min" className="text-xs text-slate-600">Min pH</label>
                  <Input
                    id="th-ph-min"
                    type="number"
                    step="0.1"
                    value={thresholds.phMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, phMin: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="th-ph-max" className="text-xs text-slate-600">Max pH</label>
                  <Input
                    id="th-ph-max"
                    type="number"
                    step="0.1"
                    value={thresholds.phMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, phMax: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Temp Bounds */}
            <div className="rounded-lg border border-[#DCE6DF] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Soil Temperature (°C)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="th-t-min" className="text-xs text-slate-600">Min (°C)</label>
                  <Input
                    id="th-t-min"
                    type="number"
                    step="0.5"
                    value={thresholds.tempMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, tempMin: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="th-t-max" className="text-xs text-slate-600">Max (°C)</label>
                  <Input
                    id="th-t-max"
                    type="number"
                    step="0.5"
                    value={thresholds.tempMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, tempMax: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* EC Bounds */}
            <div className="rounded-lg border border-[#DCE6DF] p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900">Soil EC (mS/cm)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="th-ec-min" className="text-xs text-slate-600">Min (mS/cm)</label>
                  <Input
                    id="th-ec-min"
                    type="number"
                    step="0.1"
                    value={thresholds.ecMin}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, ecMin: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="th-ec-max" className="text-xs text-slate-600">Max (mS/cm)</label>
                  <Input
                    id="th-ec-max"
                    type="number"
                    step="0.1"
                    value={thresholds.ecMax}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!Number.isNaN(v)) {
                        onUpdateThresholds({ ...thresholds, ecMax: v });
                        flashSaved();
                      }
                    }}
                    className="h-9 font-mono text-xs tabular-nums"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Configuration & Calibration + System Info */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3 border-b border-[#DCE6DF]">
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Sensor Configuration</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUpdateCalibration(DEFAULT_CALIBRATION);
                  flashSaved();
                }}
              >
                Reset
              </Button>
            </div>
            <CardDescription>
              Enable probes, adjust sampling rate, and tune calibration offsets.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-5">
            <div className="space-y-3">
              {(
                [
                  { key: 'moisture', label: 'Capacitive Soil Moisture Probe' },
                  { key: 'ph', label: 'Glass-Bulb Soil pH Electrode' },
                  { key: 'temperature', label: 'Waterproof DS18B20 Temperature Probe' },
                  { key: 'ec', label: 'Dual-Electrode Soil EC Sensor' },
                ] as const
              ).map((sensor) => (
                <div key={sensor.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-800">{sensor.label}</span>
                  <Switch
                    checked={calibration.enabledSensors[sensor.key]}
                    aria-label={`Toggle ${sensor.label}`}
                    onCheckedChange={(checked) => {
                      onUpdateCalibration({
                        ...calibration,
                        enabledSensors: {
                          ...calibration.enabledSensors,
                          [sensor.key]: checked,
                        },
                      });
                      flashSaved();
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DCE6DF]">
              <div className="space-y-1">
                <label htmlFor="cal-interval" className="text-xs text-slate-600">
                  Sampling Interval (sec)
                </label>
                <Input
                  id="cal-interval"
                  type="number"
                  min={1}
                  max={60}
                  value={calibration.samplingIntervalSec}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) {
                      onUpdateCalibration({
                        ...calibration,
                        samplingIntervalSec: Math.min(60, Math.max(1, v)),
                      });
                      flashSaved();
                    }
                  }}
                  className="h-9 font-mono text-xs tabular-nums"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="cal-ph" className="text-xs text-slate-600">
                  pH Calibration Offset
                </label>
                <Input
                  id="cal-ph"
                  type="number"
                  step="0.05"
                  value={calibration.phOffset}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v)) {
                      onUpdateCalibration({ ...calibration, phOffset: v });
                      flashSaved();
                    }
                  }}
                  className="h-9 font-mono text-xs tabular-nums"
                />
              </div>
            </div>

            {/* System Information */}
            <div className="rounded-lg border border-[#DCE6DF] bg-[#F7FAF8] p-4 space-y-2 text-xs">
              <div className="font-semibold text-slate-900">System Information</div>
              <div className="flex justify-between text-slate-600">
                <span>Platform</span>
                <span className="font-mono text-slate-900">AgroRoot AI Web Console</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Target MCU</span>
                <span className="font-mono text-slate-900">ESP32-WROOM-32 / ESP32-S3</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Firmware Profile</span>
                <span className="font-mono text-slate-900">{deviceConfig.firmwareVersion}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Analysis Engine</span>
                <span className="font-mono text-slate-900">Simulated Heuristic (API Ready)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
