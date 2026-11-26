import { SlidersHorizontal } from 'lucide-react';
import { RootZoneVisualizer } from '@/src/components/RootZoneVisualizer';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Slider } from '@/src/components/ui/slider';
import { PRESET_SIMULATIONS } from '@/src/lib/agroEngine';
import type { RootZoneEvaluation, SensorReading } from '@/src/types/agro';

interface RootZonePageProps {
  rawReading: SensorReading;
  currentReading: SensorReading;
  evaluation: RootZoneEvaluation;
  onUpdateSensor: (key: 'moisture' | 'ph' | 'temperature' | 'ec', value: number) => void;
  onApplyPreset: (preset: 'healthy' | 'lowMoisture' | 'abnormalPh') => void;
}

export function RootZonePage({
  rawReading,
  currentReading,
  evaluation,
  onUpdateSensor,
  onApplyPreset,
}: RootZonePageProps) {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Underground Root-Zone Visualization
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Interactive plant and subsurface root cross-section showing how moisture distribution, pH balance, soil temperature, and dissolved ion conductivity shape the monitored root zone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onApplyPreset('healthy')}
          >
            {PRESET_SIMULATIONS.healthy.label}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset('lowMoisture')}
          >
            {PRESET_SIMULATIONS.lowMoisture.label}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset('abnormalPh')}
          >
            {PRESET_SIMULATIONS.abnormalPh.label}
          </Button>
        </div>
      </div>

      <RootZoneVisualizer reading={currentReading} evaluation={evaluation} />

      {/* Direct Interactive Controls for Live Exploration */}
      <Card>
        <CardHeader className="pb-3 border-b border-[#DCE6DF]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#14532D]" />
            <CardTitle>Interactive Soil Parameter Controls</CardTitle>
          </div>
          <CardDescription>
            Move any slider below to observe real-time changes in soil moisture plumes, pH rhizosphere coloration, EC ion concentration, and root-zone thermal state.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Soil Moisture</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {rawReading.moisture.toFixed(1)}%
                </span>
              </div>
              <Slider
                value={[rawReading.moisture]}
                min={5}
                max={95}
                step={0.5}
                aria-label="Root Zone Soil Moisture"
                onValueChange={([v]) => onUpdateSensor('moisture', v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Soil pH</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  pH {rawReading.ph.toFixed(2)}
                </span>
              </div>
              <Slider
                value={[rawReading.ph]}
                min={3.5}
                max={9.5}
                step={0.05}
                aria-label="Root Zone Soil pH"
                onValueChange={([v]) => onUpdateSensor('ph', v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Soil Temperature</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {rawReading.temperature.toFixed(1)} °C
                </span>
              </div>
              <Slider
                value={[rawReading.temperature]}
                min={5}
                max={45}
                step={0.2}
                aria-label="Root Zone Soil Temperature"
                onValueChange={([v]) => onUpdateSensor('temperature', v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Soil EC</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900">
                  {rawReading.ec.toFixed(2)} mS/cm
                </span>
              </div>
              <Slider
                value={[rawReading.ec]}
                min={0.2}
                max={4.5}
                step={0.05}
                aria-label="Root Zone Electrical Conductivity"
                onValueChange={([v]) => onUpdateSensor('ec', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
