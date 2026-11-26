import { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Cpu,
  Database,
  LayoutDashboard,
  Sprout,
  Wifi,
} from 'lucide-react';
import { SYSTEM_ARCHITECTURE_STAGES } from '@/src/data/hardwareCatalog';

const STAGE_ICONS = [
  Sprout,
  Cpu,
  Wifi,
  Database,
  Activity,
  LayoutDashboard,
];

export function SystemArchitectureDiagram() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedStage = SYSTEM_ARCHITECTURE_STAGES[selectedIndex];

  return (
    <div className="space-y-6">
      {/* Interactive Animated Pipeline */}
      <div className="rounded-xl border border-[#DCE6DF] bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {SYSTEM_ARCHITECTURE_STAGES.map((stage, index) => {
            const Icon = STAGE_ICONS[index];
            const isSelected = selectedIndex === index;
            return (
              <div
                key={stage.id}
                className="flex flex-col lg:flex-row items-center gap-3 flex-1 min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
                    isSelected
                      ? 'border-[#14532D] bg-[#EEF5F0]'
                      : 'border-[#DCE6DF] bg-white hover:bg-[#F7FAF8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-[#15803D]">
                      {stage.step}
                    </span>
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isSelected ? 'text-[#14532D]' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <div className="text-xs font-bold tracking-tight text-slate-900 leading-snug">
                    {stage.shortLabel}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 truncate">
                    {stage.protocol}
                  </div>
                </button>

                {/* Animated Data-Flow Connector */}
                {index < SYSTEM_ARCHITECTURE_STAGES.length - 1 && (
                  <div
                    className="flex items-center justify-center shrink-0 py-1 lg:py-0"
                    aria-hidden="true"
                  >
                    {/* Desktop Horizontal Flow Arrow */}
                    <div className="hidden lg:flex items-center relative w-8 h-5 overflow-hidden">
                      <div className="w-full h-[2px] bg-[#CFE0D4]" />
                      <span className="absolute left-0 h-2 w-2 rounded-full bg-[#15803D] animate-flow-packet" />
                      <ArrowRight className="h-3.5 w-3.5 text-[#14532D] -ml-1 shrink-0" />
                    </div>
                    {/* Mobile Vertical Flow Arrow */}
                    <div className="flex lg:hidden items-center justify-center">
                      <ArrowDown className="h-4 w-4 text-[#15803D]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Stage Engineering Detail */}
        <div className="mt-6 rounded-xl border border-[#DCE6DF] bg-[#F7FAF8] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DCE6DF]">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-[#14532D]">
                Stage {selectedStage.step}
              </span>
              <h4 className="text-base font-semibold text-slate-900">
                {selectedStage.title}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <span>{selectedStage.protocol}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedStage.latency}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <p className="md:col-span-7 text-sm text-slate-700 leading-relaxed">
              {selectedStage.description}
            </p>
            <div className="md:col-span-5 rounded-lg border border-slate-200 bg-slate-900 p-3.5 text-xs font-mono text-emerald-300 overflow-x-auto">
              <div className="text-[11px] text-slate-400 mb-1">
                Sample Signal / Payload Frame
              </div>
              <code className="break-all">{selectedStage.payloadExample}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
