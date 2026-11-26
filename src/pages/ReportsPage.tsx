import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { exportReadingsToCSV, generateTimeframeDataset } from '@/src/lib/agroEngine';
import type { SensorReading, SensorThresholds } from '@/src/types/agro';

interface ReportsPageProps {
  liveHistory: SensorReading[];
  thresholds: SensorThresholds;
}

type TimeframeKey = 'daily' | 'weekly' | 'monthly' | 'session';

export function ReportsPage({ liveHistory, thresholds }: ReportsPageProps) {
  const [timeframe, setTimeframe] = useState<TimeframeKey>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const activeRows = useMemo(() => {
    if (timeframe === 'session') return liveHistory;
    return generateTimeframeDataset(timeframe);
  }, [timeframe, liveHistory]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeRows;
    return activeRows.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.timestamp.toLowerCase().includes(q)
    );
  }, [activeRows, searchQuery]);

  const stats = useMemo(() => {
    const calc = (vals: number[], decimals: number) => {
      if (vals.length === 0) return { min: '0', max: '0', avg: '0' };
      const min = Math.min(...vals).toFixed(decimals);
      const max = Math.max(...vals).toFixed(decimals);
      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(decimals);
      return { min, max, avg };
    };
    return {
      moisture: calc(activeRows.map((r) => r.moisture), 1),
      ph: calc(activeRows.map((r) => r.ph), 2),
      temperature: calc(activeRows.map((r) => r.temperature), 1),
      ec: calc(activeRows.map((r) => r.ec), 2),
    };
  }, [activeRows]);

  const handleDownloadCSV = () => {
    const filename = `agroroot-ai-${timeframe}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    exportReadingsToCSV(filteredRows, filename);
    setExportNotice(`Downloaded ${filename} (${filteredRows.length} rows)`);
    window.setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header + CSV Export Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Data History &amp; Agronomic Reports
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Inspect daily sensor readings, weekly trends, monthly soil patterns, or your live simulation session log, and export clean CSV reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button onClick={handleDownloadCSV}>
            <Download className="h-4 w-4" />
            <span>Download CSV Report</span>
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {exportNotice}
        </div>
      )}

      {/* Timeframe Segmented Switcher + Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#DCE6DF] bg-white p-4">
        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-[#EEF5F0] p-1 border border-[#DCE6DF]"
          role="group"
          aria-label="Report Timeframe"
        >
          {(
            [
              { id: 'daily', label: 'Daily Readings (24h)' },
              { id: 'weekly', label: 'Weekly Trends (7d)' },
              { id: 'monthly', label: 'Monthly Trends (30d)' },
              { id: 'session', label: 'Live Session Log' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                timeframe === item.id
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by time or label..."
            aria-label="Filter telemetry rows"
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Statistical Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Moisture Summary', unit: '%', s: stats.moisture },
          { title: 'Soil pH Summary', unit: 'pH', s: stats.ph },
          { title: 'Temperature Summary', unit: '°C', s: stats.temperature },
          { title: 'Conductivity (EC) Summary', unit: 'mS/cm', s: stats.ec },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-[#DCE6DF] bg-white p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-600">{item.title}</div>
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-xl font-bold text-slate-900">
                {item.s.avg} <span className="text-xs font-normal text-slate-500">{item.unit} avg</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 tabular-nums pt-1 border-t border-[#DCE6DF]">
              <span>Min: {item.s.min}</span>
              <span>Max: {item.s.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Historical Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Soil Moisture History (%)</CardTitle>
            <CardDescription>Volumetric root-zone water percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeRows} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="histMoist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={16} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', borderColor: '#DCE6DF' }} />
                  <Area type="monotone" dataKey="moisture" name="Moisture (%)" stroke="#0284C7" strokeWidth={2} fill="url(#histMoist)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Soil pH History</CardTitle>
            <CardDescription>Rhizosphere acidity / alkalinity stability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeRows} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={16} />
                  <YAxis domain={[3.5, 9.5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', borderColor: '#DCE6DF' }} />
                  <Line type="monotone" dataKey="ph" name="Soil pH" stroke="#15803D" strokeWidth={2.2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Soil Temperature History (°C)</CardTitle>
            <CardDescription>Subsurface thermal profile from DS18B20 probe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeRows} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="histTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={16} />
                  <YAxis domain={[5, 45]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', borderColor: '#DCE6DF' }} />
                  <Area type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#EA580C" strokeWidth={2} fill="url(#histTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Electrical Conductivity (EC) History (mS/cm)</CardTitle>
            <CardDescription>Dissolved mineral ion concentration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeRows} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EAE5" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={16} />
                  <YAxis domain={[0, 4.5]} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', borderColor: '#DCE6DF' }} />
                  <Line type="monotone" dataKey="ec" name="EC (mS/cm)" stroke="#D97706" strokeWidth={2.2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Data Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-[#DCE6DF]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Recorded Sensor Telemetry Table</CardTitle>
              <CardDescription>
                Showing {filteredRows.length} of {activeRows.length} records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredRows.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-900">No matching telemetry records</p>
              <p className="text-xs text-slate-500">
                Try clearing your search filter to inspect the complete dataset.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear Filter
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#DCE6DF] bg-[#F7FAF8] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-3 px-4">Interval</th>
                  <th className="py-3 px-4 text-right">Moisture (%)</th>
                  <th className="py-3 px-4 text-right">Soil pH</th>
                  <th className="py-3 px-4 text-right">Temp (°C)</th>
                  <th className="py-3 px-4 text-right">EC (mS/cm)</th>
                  <th className="py-3 px-4">Threshold State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6DF]">
                {filteredRows.map((row, idx) => {
                  const outOfRange =
                    row.moisture < thresholds.moistureMin ||
                    row.moisture > thresholds.moistureMax ||
                    row.ph < thresholds.phMin ||
                    row.ph > thresholds.phMax ||
                    row.temperature < thresholds.tempMin ||
                    row.temperature > thresholds.tempMax ||
                    row.ec < thresholds.ecMin ||
                    row.ec > thresholds.ecMax;
                  return (
                    <tr key={`${row.timestamp}-${idx}`} className="hover:bg-[#F7FAF8]">
                      <td className="py-2.5 px-4 font-mono text-xs font-medium text-slate-900">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.moisture.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.ph.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.temperature.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">
                        {row.ec.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-medium">
                        {outOfRange ? (
                          <span className="text-amber-700">Threshold Deviation</span>
                        ) : (
                          <span className="text-emerald-700">Nominal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
