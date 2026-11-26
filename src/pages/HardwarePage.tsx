import { useState } from 'react';
import { Cpu } from 'lucide-react';
import { SystemArchitectureDiagram } from '@/src/components/SystemArchitectureDiagram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { HARDWARE_COMPONENTS } from '@/src/data/hardwareCatalog';
import type { HardwareComponentInfo } from '@/src/types/agro';

const CATEGORIES: Array<'All' | HardwareComponentInfo['category']> = [
  'All',
  'Controller',
  'Sensing Probe',
  'Display & Power',
  'Interconnect',
];

export function HardwarePage() {
  const [category, setCategory] = useState<'All' | HardwareComponentInfo['category']>('All');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredComponents =
    category === 'All'
      ? HARDWARE_COMPONENTS
      : HARDWARE_COMPONENTS.filter((c) => c.category === category);

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Hardware Components &amp; System Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
          Complete engineering bill of materials, working principles, ESP32 GPIO pin connections, and animated end-to-end telemetry architecture.
        </p>
      </div>

      <Tabs defaultValue="components" className="w-full">
        <TabsList>
          <TabsTrigger value="components">Hardware Components (10)</TabsTrigger>
          <TabsTrigger value="architecture">System Architecture Diagram</TabsTrigger>
          <TabsTrigger value="pinout">ESP32 Wiring &amp; Pinout</TabsTrigger>
        </TabsList>

        {/* Tab 1: All 10 Hardware Components */}
        <TabsContent value="components" className="space-y-6 mt-6">
          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === cat
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-white text-slate-700 border-[#DCE6DF] hover:bg-[#EEF5F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredComponents.map((comp) => (
              <Card key={comp.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[16/9] w-full bg-[#EEF5F0] border-b border-[#DCE6DF] overflow-hidden relative">
                  {!failedImages[comp.id] ? (
                    <img
                      src={comp.image}
                      alt={comp.name}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [comp.id]: true }))
                      }
                      className={`h-full w-full object-cover ${comp.imageFocus}`}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-[#EEF5F0]">
                      <Cpu className="h-10 w-10 text-[#14532D] mb-2" />
                      <span className="text-sm font-semibold text-slate-900">
                        {comp.name}
                      </span>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#15803D]">{comp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{comp.model}</span>
                  </div>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-600 pt-1">
                    <span>{comp.operatingVoltage}</span>
                    <span aria-hidden="true">/</span>
                    <span>{comp.interfaceType}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm flex-1">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
                      Purpose
                    </h4>
                    <p className="text-slate-700 leading-relaxed">{comp.purpose}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-0.5">
                      Working Principle
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      {comp.workingPrinciple}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#DCE6DF] bg-[#F7FAF8] p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[#14532D] mb-0.5">
                      Connection to ESP32
                    </h4>
                    <p className="font-mono text-xs text-slate-800 leading-relaxed">
                      {comp.esp32Connection}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Animated System Architecture Diagram */}
        <TabsContent value="architecture" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Animated End-to-End Telemetry Architecture</CardTitle>
              <CardDescription>
                Interactive flow from underground probes through ESP32 processing, Wi-Fi transmission, cloud storage, AI-assisted scoring, and farmer alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemArchitectureDiagram />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: ESP32 Pinout & Wiring Matrix */}
        <TabsContent value="pinout" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ESP32 GPIO Pin Assignment Matrix</CardTitle>
              <CardDescription>
                Hardware interface map engineered to avoid Wi-Fi ADC2 conflicts by isolating analog sensors on ADC1 channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#DCE6DF] text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-4">Peripheral Module</th>
                    <th className="py-3 pr-4">Signal / Bus</th>
                    <th className="py-3 pr-4">ESP32 Pin</th>
                    <th className="py-3 pr-4">Power Rail</th>
                    <th className="py-3">Engineering Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6DF] text-slate-700">
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">Capacitive Moisture Sensor</td>
                    <td className="py-3 pr-4 font-mono text-xs">Analog AOUT</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">GPIO 34 (ADC1_CH6)</td>
                    <td className="py-3 pr-4 font-mono text-xs">3.3V / GND</td>
                    <td className="py-3 text-xs">Input-only ADC1 pin; unaffected by Wi-Fi radio activity</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">Soil pH Sensor &amp; BNC Module</td>
                    <td className="py-3 pr-4 font-mono text-xs">Analog PO</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">GPIO 35 (ADC1_CH7)</td>
                    <td className="py-3 pr-4 font-mono text-xs">5.0V / GND</td>
                    <td className="py-3 text-xs">Scaled 0–3.3V analog output with 2-point buffer calibration</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">Soil EC Conductivity Probe</td>
                    <td className="py-3 pr-4 font-mono text-xs">Analog AOUT</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">GPIO 32 (ADC1_CH4)</td>
                    <td className="py-3 pr-4 font-mono text-xs">5.0V / GND</td>
                    <td className="py-3 text-xs">Temperature-compensated against DS18B20 reading</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">DS18B20 Soil Temp Probe</td>
                    <td className="py-3 pr-4 font-mono text-xs">1-Wire DATA</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">GPIO 4</td>
                    <td className="py-3 pr-4 font-mono text-xs">3.3V / GND</td>
                    <td className="py-3 text-xs">Requires external 4.7 kΩ pull-up resistor to 3.3V rail</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">0.96-inch OLED Display (SSD1306)</td>
                    <td className="py-3 pr-4 font-mono text-xs">I2C (SDA / SCL)</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">GPIO 21 / GPIO 22</td>
                    <td className="py-3 pr-4 font-mono text-xs">3.3V / GND</td>
                    <td className="py-3 text-xs">Standard hardware I2C address 0x3C</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium text-slate-900">Regulated Buck Power Supply</td>
                    <td className="py-3 pr-4 font-mono text-xs">5V &amp; 3.3V DC</td>
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#14532D]">VIN / 3V3 / GND</td>
                    <td className="py-3 pr-4 font-mono text-xs">7–12V In</td>
                    <td className="py-3 text-xs">Common ground star-routed on carrier PCB/breadboard</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
