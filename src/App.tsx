import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgroLogoMark } from '@/src/components/AgroLogo';
import { Navbar } from '@/src/components/Navbar';
import {
  applyCalibration,
  DEFAULT_CALIBRATION,
  DEFAULT_THRESHOLDS,
  evaluateRootZone,
  generateAlerts,
  generateInitialLiveHistory,
  generateSimulatedAIAnalysis,
  PRESET_SIMULATIONS,
} from '@/src/lib/agroEngine';
import { DashboardPage } from '@/src/pages/DashboardPage';
import { HardwarePage } from '@/src/pages/HardwarePage';
import { HomePage } from '@/src/pages/HomePage';
import { ReportsPage } from '@/src/pages/ReportsPage';
import { RootZonePage } from '@/src/pages/RootZonePage';
import { SettingsPage } from '@/src/pages/SettingsPage';
import type {
  DeviceConfig,
  OperationMode,
  PageId,
  SensorCalibration,
  SensorReading,
  SensorThresholds,
} from '@/src/types/agro';

const INITIAL_RAW: SensorReading = {
  timestamp: new Date().toISOString(),
  label: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
  moisture: PRESET_SIMULATIONS.healthy.moisture,
  ph: PRESET_SIMULATIONS.healthy.ph,
  temperature: PRESET_SIMULATIONS.healthy.temperature,
  ec: PRESET_SIMULATIONS.healthy.ec,
};

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [mode, setMode] = useState<OperationMode>('demo');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [rawReading, setRawReading] = useState<SensorReading>(INITIAL_RAW);
  const [history, setHistory] = useState<SensorReading[]>(() =>
    generateInitialLiveHistory(INITIAL_RAW)
  );
  const [thresholds, setThresholds] = useState<SensorThresholds>(DEFAULT_THRESHOLDS);
  const [calibration, setCalibration] = useState<SensorCalibration>(DEFAULT_CALIBRATION);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [liveProbeResult, setLiveProbeResult] = useState<string | null>(null);
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>({
    deviceId: 'AGR-ESP32-NODE-01',
    firmwareVersion: 'v1.4.2-esp32',
    wifiSsid: 'AgroField-2.4GHz',
    wifiRssiDbm: -58,
    apiEndpoint: '',
    mqttBroker: 'mqtt://broker.agroroot.local:1883',
    mqttTopic: 'agroroot/node01/telemetry',
  });

  const previousReadingRef = useRef<SensorReading | undefined>(undefined);

  const calibratedReading = useMemo(
    () => applyCalibration(rawReading, calibration),
    [rawReading, calibration]
  );

  const calibratedHistory = useMemo(
    () => history.map((item) => applyCalibration(item, calibration)),
    [history, calibration]
  );

  const evaluation = useMemo(
    () => evaluateRootZone(calibratedReading, thresholds),
    [calibratedReading, thresholds]
  );

  const alerts = useMemo(
    () => generateAlerts(calibratedReading, thresholds),
    [calibratedReading, thresholds]
  );

  const analysis = useMemo(
    () =>
      generateSimulatedAIAnalysis(
        calibratedReading,
        previousReadingRef.current,
        thresholds
      ),
    [calibratedReading, thresholds]
  );

  const pushSample = useCallback((nextRaw: SensorReading) => {
    setRawReading((prev) => {
      previousReadingRef.current = applyCalibration(prev, calibration);
      return nextRaw;
    });
    setHistory((prev) => [...prev.slice(-15), nextRaw]);
  }, [calibration]);

  // Demo Mode: Subtle simulated sensor drift interval
  useEffect(() => {
    if (mode !== 'demo' || !isStreaming) return;
    const intervalMs = Math.max(1000, calibration.samplingIntervalSec * 1000);
    const id = window.setInterval(() => {
      const now = new Date();
      setRawReading((prev) => {
        previousReadingRef.current = applyCalibration(prev, calibration);
        const jitter = (range: number) => (Math.random() - 0.5) * range;
        const next: SensorReading = {
          timestamp: now.toISOString(),
          label: now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          moisture: +Math.min(95, Math.max(5, prev.moisture + jitter(1.2))).toFixed(1),
          ph: +Math.min(9.5, Math.max(3.5, prev.ph + jitter(0.06))).toFixed(2),
          temperature: +Math.min(45, Math.max(5, prev.temperature + jitter(0.3))).toFixed(1),
          ec: +Math.min(4.5, Math.max(0.2, prev.ec + jitter(0.05))).toFixed(2),
        };
        setHistory((h) => [...h.slice(-15), next]);
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [mode, isStreaming, calibration]);

  // Live Device Mode: Poll configured ESP32 REST JSON endpoint if provided
  useEffect(() => {
    const endpoint = deviceConfig.apiEndpoint.trim();
    if (mode !== 'live' || !endpoint) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(endpoint, { method: 'GET' });
        if (!res.ok) return;
        const payload = await res.json();
        const s = payload?.sensors ?? payload;
        if (
          typeof s?.soilMoisturePct === 'number' ||
          typeof s?.moisture === 'number'
        ) {
          const now = new Date();
          const next: SensorReading = {
            timestamp: now.toISOString(),
            label: now.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            moisture: Number(s.soilMoisturePct ?? s.moisture ?? 50),
            ph: Number(s.soilPh ?? s.ph ?? 6.5),
            temperature: Number(s.soilTempC ?? s.temperature ?? 23),
            ec: Number(s.soilEcMsCm ?? s.ec ?? 1.6),
          };
          if (!cancelled) {
            pushSample(next);
          }
        }
      } catch {
        // Endpoint unreachable; preserve last state cleanly without fabricating live data
      }
    };

    poll();
    const id = window.setInterval(poll, Math.max(2000, calibration.samplingIntervalSec * 1000));
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [mode, deviceConfig.apiEndpoint, calibration.samplingIntervalSec, pushSample]);

  const handleUpdateSensor = (
    key: 'moisture' | 'ph' | 'temperature' | 'ec',
    value: number
  ) => {
    // Pause auto-drift when manually adjusting sliders so presenter holds exact scenario
    setIsStreaming(false);
    setDismissedAlertIds([]);
    const now = new Date();
    const next: SensorReading = {
      ...rawReading,
      timestamp: now.toISOString(),
      label: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      [key]: value,
    };
    pushSample(next);
  };

  const handleApplyPreset = (presetKey: 'healthy' | 'lowMoisture' | 'abnormalPh') => {
    setMode('demo');
    setIsStreaming(false);
    setDismissedAlertIds([]);
    const preset = PRESET_SIMULATIONS[presetKey];
    const now = new Date();
    const next: SensorReading = {
      timestamp: now.toISOString(),
      label: now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      moisture: preset.moisture,
      ph: preset.ph,
      temperature: preset.temperature,
      ec: preset.ec,
    };
    pushSample(next);
  };

  const handleTestLiveEndpoint = async () => {
    const endpoint = deviceConfig.apiEndpoint.trim();
    if (!endpoint) {
      setLiveProbeResult('Enter a valid ESP32 HTTP/HTTPS telemetry URL first.');
      return;
    }
    setLiveProbeResult('Testing endpoint...');
    try {
      const res = await fetch(endpoint, { method: 'GET' });
      if (res.ok) {
        setLiveProbeResult(`Connected (HTTP ${res.status}). Ready for Live Device Mode.`);
      } else {
        setLiveProbeResult(`Endpoint responded with HTTP ${res.status}. Verify ESP32 route.`);
      }
    } catch {
      setLiveProbeResult('Unable to reach endpoint from browser (check URL or CORS headers).');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF8] text-slate-900">
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            currentReading={calibratedReading}
            evaluation={evaluation}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            mode={mode}
            onModeChange={setMode}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming((prev) => !prev)}
            rawReading={rawReading}
            currentReading={calibratedReading}
            history={calibratedHistory}
            thresholds={thresholds}
            evaluation={evaluation}
            alerts={alerts}
            dismissedAlertIds={dismissedAlertIds}
            onDismissAlert={(id) =>
              setDismissedAlertIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
            }
            analysis={analysis}
            onUpdateSensor={handleUpdateSensor}
            onApplyPreset={handleApplyPreset}
            onNavigate={setActivePage}
            liveEndpointConfigured={Boolean(deviceConfig.apiEndpoint.trim())}
          />
        )}

        {activePage === 'root-zone' && (
          <RootZonePage
            rawReading={rawReading}
            currentReading={calibratedReading}
            evaluation={evaluation}
            onUpdateSensor={handleUpdateSensor}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {activePage === 'hardware' && <HardwarePage />}

        {activePage === 'reports' && (
          <ReportsPage liveHistory={calibratedHistory} thresholds={thresholds} />
        )}

        {activePage === 'settings' && (
          <SettingsPage
            mode={mode}
            onModeChange={setMode}
            thresholds={thresholds}
            onUpdateThresholds={(next) => {
              setThresholds(next);
              setDismissedAlertIds([]);
            }}
            calibration={calibration}
            onUpdateCalibration={setCalibration}
            deviceConfig={deviceConfig}
            onUpdateDeviceConfig={setDeviceConfig}
            currentReading={calibratedReading}
            liveProbeResult={liveProbeResult}
            onTestLiveEndpoint={handleTestLiveEndpoint}
          />
        )}
      </main>

      <footer className="border-t border-[#DCE6DF] bg-white">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <AgroLogoMark className="h-6 w-6" />
              <span className="font-display text-base font-bold text-slate-900">
                AgroRoot AI
              </span>
            </div>
            <p className="text-xs text-slate-600">
              AgroRoot AI – Understanding Plant Health from the Roots Up.
            </p>
          </div>

          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600"
          >
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'dashboard', label: 'Live Dashboard' },
                { id: 'root-zone', label: 'Root Visualization' },
                { id: 'hardware', label: 'Hardware & Architecture' },
                { id: 'reports', label: 'Reports & CSV' },
                { id: 'settings', label: 'Settings' },
              ] as const
            ).map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  setActivePage(link.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#14532D] transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
