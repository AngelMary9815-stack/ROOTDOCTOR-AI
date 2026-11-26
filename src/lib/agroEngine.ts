import type {
  AIAnalysisReport,
  AlertSeverity,
  ParameterEvaluation,
  PlantCondition,
  RootZoneAlert,
  RootZoneEvaluation,
  SensorCalibration,
  SensorReading,
  SensorThresholds,
} from '@/src/types/agro';

export const DEFAULT_THRESHOLDS: SensorThresholds = {
  moistureMin: 35,
  moistureMax: 72,
  phMin: 5.8,
  phMax: 7.2,
  tempMin: 16,
  tempMax: 30,
  ecMin: 1.0,
  ecMax: 2.6,
};

export const DEFAULT_CALIBRATION: SensorCalibration = {
  moistureOffset: 0,
  phOffset: 0,
  tempOffset: 0,
  ecMultiplier: 1.0,
  samplingIntervalSec: 3,
  enabledSensors: {
    moisture: true,
    ph: true,
    temperature: true,
    ec: true,
  },
};

export const PRESET_SIMULATIONS = {
  healthy: {
    label: 'A. Healthy Soil Condition',
    moisture: 54,
    ph: 6.5,
    temperature: 22.8,
    ec: 1.75,
  },
  lowMoisture: {
    label: 'B. Low Moisture Condition',
    moisture: 21,
    ph: 6.4,
    temperature: 28.4,
    ec: 2.15,
  },
  abnormalPh: {
    label: 'C. Abnormal pH Condition',
    moisture: 48,
    ph: 4.5,
    temperature: 23.6,
    ec: 2.95,
  },
} as const;

export function applyCalibration(
  raw: SensorReading,
  calibration: SensorCalibration
): SensorReading {
  return {
    ...raw,
    moisture: Math.min(100, Math.max(0, +(raw.moisture + calibration.moistureOffset).toFixed(1))),
    ph: Math.min(9.5, Math.max(3.5, +(raw.ph + calibration.phOffset).toFixed(2))),
    temperature: Math.min(50, Math.max(0, +(raw.temperature + calibration.tempOffset).toFixed(1))),
    ec: Math.min(6.0, Math.max(0.05, +(raw.ec * calibration.ecMultiplier).toFixed(2))),
  };
}

function scoreRange(
  value: number,
  min: number,
  max: number,
  softMargin: number
): { score: number; severity: AlertSeverity } {
  if (value >= min && value <= max) {
    const center = (min + max) / 2;
    const halfSpan = Math.max(0.01, (max - min) / 2);
    const normDist = Math.abs(value - center) / halfSpan;
    const score = Math.round(100 - normDist * 15);
    return { score, severity: 'nominal' };
  }
  const dist = value < min ? min - value : value - max;
  if (dist <= softMargin * 0.6) {
    return { score: Math.round(72 - (dist / softMargin) * 20), severity: 'advisory' };
  }
  if (dist <= softMargin * 1.4) {
    return { score: Math.round(52 - (dist / (softMargin * 1.4)) * 22), severity: 'warning' };
  }
  return { score: Math.max(8, Math.round(28 - dist * 3)), severity: 'critical' };
}

export function evaluateRootZone(
  reading: SensorReading,
  thresholds: SensorThresholds
): RootZoneEvaluation {
  // Soil Moisture
  const mEval = scoreRange(reading.moisture, thresholds.moistureMin, thresholds.moistureMax, 14);
  const moisture: ParameterEvaluation = {
    status:
      reading.moisture < thresholds.moistureMin
        ? 'Low'
        : reading.moisture > thresholds.moistureMax
        ? 'High'
        : 'Healthy',
    severity: mEval.severity,
    score: mEval.score,
    detail:
      reading.moisture < thresholds.moistureMin
        ? `${(thresholds.moistureMin - reading.moisture).toFixed(1)}% below target floor`
        : reading.moisture > thresholds.moistureMax
        ? `${(reading.moisture - thresholds.moistureMax).toFixed(1)}% above field capacity`
        : 'Within optimal root-zone water band',
  };

  // Soil pH
  const pEval = scoreRange(reading.ph, thresholds.phMin, thresholds.phMax, 0.9);
  const ph: ParameterEvaluation = {
    status:
      reading.ph < thresholds.phMin
        ? 'Acidic'
        : reading.ph > thresholds.phMax
        ? 'Alkaline'
        : 'Neutral',
    severity: pEval.severity,
    score: pEval.score,
    detail:
      reading.ph < thresholds.phMin
        ? 'Acidic rhizosphere risk (P/Ca/Mg uptake reduced)'
        : reading.ph > thresholds.phMax
        ? 'Alkaline shift (Fe/Mn/Zn micronutrient lock risk)'
        : 'Balanced rhizosphere ion solubility',
  };

  // Soil Temperature
  const tEval = scoreRange(reading.temperature, thresholds.tempMin, thresholds.tempMax, 6);
  const temperature: ParameterEvaluation = {
    status:
      reading.temperature < thresholds.tempMin
        ? 'Cool'
        : reading.temperature > thresholds.tempMax
        ? 'High'
        : 'Optimal',
    severity: tEval.severity,
    score: tEval.score,
    detail:
      reading.temperature < thresholds.tempMin
        ? 'Slowed root metabolic uptake expected'
        : reading.temperature > thresholds.tempMax
        ? 'Elevated root-zone thermal load'
        : 'Ideal thermal window for root respiration',
  };

  // Soil EC
  const eEval = scoreRange(reading.ec, thresholds.ecMin, thresholds.ecMax, 0.7);
  const ec: ParameterEvaluation = {
    status:
      reading.ec < thresholds.ecMin
        ? 'Low Nutrients'
        : reading.ec > thresholds.ecMax
        ? 'High Salinity'
        : 'Optimal',
    severity: eEval.severity,
    score: eEval.score,
    detail:
      reading.ec < thresholds.ecMin
        ? 'Dilute soluble ionic concentration'
        : reading.ec > thresholds.ecMax
        ? 'High osmotic salt pressure in pore water'
        : 'Balanced dissolved nutrient conductivity',
  };

  // Weighted Root-Zone Health Score (0-100)
  const rawScore = Math.round(
    moisture.score * 0.34 + ph.score * 0.28 + ec.score * 0.22 + temperature.score * 0.16
  );
  const healthScore = Math.min(100, Math.max(0, rawScore));

  let overallCondition: PlantCondition = 'Healthy';
  const hasCritical = [moisture, ph, temperature, ec].some((p) => p.severity === 'critical');
  const warningCount = [moisture, ph, temperature, ec].filter(
    (p) => p.severity === 'warning' || p.severity === 'advisory'
  ).length;

  if (healthScore < 50 || hasCritical) {
    overallCondition = 'Critical';
  } else if (healthScore < 78 || warningCount >= 1) {
    overallCondition = 'Moderate';
  }

  return {
    healthScore,
    overallCondition,
    moisture,
    ph,
    temperature,
    ec,
  };
}

export function generateAlerts(
  reading: SensorReading,
  thresholds: SensorThresholds
): RootZoneAlert[] {
  const alerts: RootZoneAlert[] = [];
  const time = reading.label;

  if (reading.moisture < thresholds.moistureMin) {
    const deficit = thresholds.moistureMin - reading.moisture;
    alerts.push({
      id: 'alert-low-moisture',
      code: 'LOW MOISTURE',
      title: 'Low Soil Moisture Detected',
      message:
        'Warning! Soil moisture is below the configured threshold. Check irrigation requirements.',
      severity: deficit >= 12 ? 'critical' : 'warning',
      parameter: 'moisture',
      valueLabel: `${reading.moisture.toFixed(1)}% (Min ${thresholds.moistureMin}%)`,
      timestamp: time,
    });
  } else if (reading.moisture > thresholds.moistureMax) {
    alerts.push({
      id: 'alert-high-moisture',
      code: 'HIGH MOISTURE',
      title: 'Root-Zone Over-Saturation',
      message:
        'Advisory: Soil moisture exceeds the upper threshold. Pause irrigation to maintain root aeration.',
      severity: reading.moisture - thresholds.moistureMax >= 12 ? 'warning' : 'advisory',
      parameter: 'moisture',
      valueLabel: `${reading.moisture.toFixed(1)}% (Max ${thresholds.moistureMax}%)`,
      timestamp: time,
    });
  }

  if (reading.ph < thresholds.phMin || reading.ph > thresholds.phMax) {
    const dist =
      reading.ph < thresholds.phMin
        ? thresholds.phMin - reading.ph
        : reading.ph - thresholds.phMax;
    alerts.push({
      id: 'alert-abnormal-ph',
      code: 'ABNORMAL pH',
      title: reading.ph < thresholds.phMin ? 'Acidic Soil pH Alert' : 'Alkaline Soil pH Alert',
      message:
        'Alert! Soil pH is outside the configured range. Soil management may be required.',
      severity: dist >= 0.9 ? 'critical' : 'warning',
      parameter: 'ph',
      valueLabel: `pH ${reading.ph.toFixed(2)} (Target ${thresholds.phMin}–${thresholds.phMax})`,
      timestamp: time,
    });
  }

  if (reading.temperature > thresholds.tempMax) {
    const excess = reading.temperature - thresholds.tempMax;
    alerts.push({
      id: 'alert-high-temp',
      code: 'HIGH TEMPERATURE',
      title: 'Elevated Soil Temperature',
      message:
        'Warning! Soil temperature is above the configured threshold.',
      severity: excess >= 6 ? 'critical' : 'warning',
      parameter: 'temperature',
      valueLabel: `${reading.temperature.toFixed(1)} °C (Max ${thresholds.tempMax} °C)`,
      timestamp: time,
    });
  } else if (reading.temperature < thresholds.tempMin) {
    alerts.push({
      id: 'alert-low-temp',
      code: 'LOW TEMPERATURE',
      title: 'Cool Root-Zone Temperature',
      message:
        'Advisory: Soil temperature is below the optimal metabolic window.',
      severity: 'advisory',
      parameter: 'temperature',
      valueLabel: `${reading.temperature.toFixed(1)} °C (Min ${thresholds.tempMin} °C)`,
      timestamp: time,
    });
  }

  if (reading.ec < thresholds.ecMin || reading.ec > thresholds.ecMax) {
    const dist =
      reading.ec < thresholds.ecMin
        ? thresholds.ecMin - reading.ec
        : reading.ec - thresholds.ecMax;
    alerts.push({
      id: 'alert-abnormal-ec',
      code: 'ABNORMAL EC',
      title:
        reading.ec > thresholds.ecMax
          ? 'High Soil Salinity / EC Alert'
          : 'Low Soil Conductivity / EC Alert',
      message:
        'Alert! Soil electrical conductivity is outside the configured range.',
      severity: dist >= 0.8 ? 'critical' : 'warning',
      parameter: 'ec',
      valueLabel: `${reading.ec.toFixed(2)} mS/cm (Target ${thresholds.ecMin}–${thresholds.ecMax})`,
      timestamp: time,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'alert-nominal',
      code: 'ALL PARAMETERS NOMINAL',
      title: 'Root-Zone Environment Stable',
      message:
        'All four root-zone sensors are operating inside configured agronomic thresholds.',
      severity: 'nominal',
      parameter: 'system',
      valueLabel: '4 / 4 sensors nominal',
      timestamp: time,
    });
  }

  return alerts;
}

export function generateSimulatedAIAnalysis(
  current: SensorReading,
  previous: SensorReading | undefined,
  thresholds: SensorThresholds
): AIAnalysisReport {
  const evaluation = evaluateRootZone(current, thresholds);
  const abnormalReadings: string[] = [];
  const trendObservations: string[] = [];
  const recommendations: string[] = [];

  if (current.moisture < thresholds.moistureMin) {
    abnormalReadings.push(
      `Soil moisture (${current.moisture.toFixed(1)}%) is ${(
        thresholds.moistureMin - current.moisture
      ).toFixed(1)}% below minimum threshold (${thresholds.moistureMin}%).`
    );
  } else if (current.moisture > thresholds.moistureMax) {
    abnormalReadings.push(
      `Soil moisture (${current.moisture.toFixed(1)}%) exceeds upper threshold (${thresholds.moistureMax}%), reducing rhizosphere oxygen diffusion.`
    );
  }

  if (current.ph < thresholds.phMin) {
    abnormalReadings.push(
      `Soil pH (${current.ph.toFixed(2)}) is strongly acidic relative to target range (${thresholds.phMin}–${thresholds.phMax}).`
    );
  } else if (current.ph > thresholds.phMax) {
    abnormalReadings.push(
      `Soil pH (${current.ph.toFixed(2)}) is alkaline relative to target range (${thresholds.phMin}–${thresholds.phMax}).`
    );
  }

  if (current.temperature > thresholds.tempMax) {
    abnormalReadings.push(
      `Root-zone temperature (${current.temperature.toFixed(1)} °C) exceeds upper limit (${thresholds.tempMax} °C), accelerating moisture evaporation.`
    );
  } else if (current.temperature < thresholds.tempMin) {
    abnormalReadings.push(
      `Root-zone temperature (${current.temperature.toFixed(1)} °C) is below ${thresholds.tempMin} °C, slowing nutrient transport.`
    );
  }

  if (current.ec > thresholds.ecMax) {
    abnormalReadings.push(
      `Electrical conductivity (${current.ec.toFixed(2)} mS/cm) exceeds ${thresholds.ecMax} mS/cm, indicating excess dissolved salt accumulation.`
    );
  } else if (current.ec < thresholds.ecMin) {
    abnormalReadings.push(
      `Electrical conductivity (${current.ec.toFixed(2)} mS/cm) is below ${thresholds.ecMin} mS/cm, suggesting low soluble mineral availability.`
    );
  }

  if (previous) {
    const dm = current.moisture - previous.moisture;
    const dph = current.ph - previous.ph;
    const dt = current.temperature - previous.temperature;
    const dec = current.ec - previous.ec;

    if (Math.abs(dm) >= 3) {
      trendObservations.push(
        `Rapid moisture ${dm > 0 ? 'increase' : 'drop'} of ${Math.abs(dm).toFixed(1)}% detected since previous sample.`
      );
    }
    if (Math.abs(dph) >= 0.25) {
      trendObservations.push(
        `Noticeable pH shift (${dph > 0 ? '+' : ''}${dph.toFixed(2)}) observed across recent telemetry window.`
      );
    }
    if (Math.abs(dt) >= 1.5) {
      trendObservations.push(
        `Soil temperature shifted by ${dt > 0 ? '+' : ''}${dt.toFixed(1)} °C.`
      );
    }
    if (Math.abs(dec) >= 0.25) {
      trendObservations.push(
        `Conductivity changed by ${dec > 0 ? '+' : ''}${dec.toFixed(2)} mS/cm, indicating active solute movement.`
      );
    }
  }

  if (trendObservations.length === 0) {
    trendObservations.push(
      'Short-interval sensor variance remains steady with no abrupt transient spikes detected.'
    );
  }

  // Irrigation guidance
  let irrigationRequirement = 'Maintain current scheduled drip interval; no supplemental irrigation needed.';
  if (current.moisture < thresholds.moistureMin) {
    const deficit = thresholds.moistureMin - current.moisture;
    const minutes = Math.min(45, Math.max(10, Math.round(deficit * 1.4 + 8)));
    irrigationRequirement = `Supplemental drip irrigation recommended (~${minutes} min cycle) to restore volumetric moisture toward ${Math.round(
      (thresholds.moistureMin + thresholds.moistureMax) / 2
    )}%.`;
    recommendations.push(
      'Trigger staged drip irrigation in short pulses to re-wet the root zone without runoff.'
    );
  } else if (current.moisture > thresholds.moistureMax) {
    irrigationRequirement = 'Suspend irrigation cycles for 12–24 hours until moisture drains below upper threshold.';
    recommendations.push(
      'Verify field drainage channels and pause automated watering until moisture stabilizes inside target band.'
    );
  }

  // pH and EC guidance
  let phAndEcAssessment = 'Soil pH and EC are balanced, supporting favorable macro- and micronutrient solubility.';
  if (current.ph < thresholds.phMin && current.ec > thresholds.ecMax) {
    phAndEcAssessment =
      'Acidic pH combined with elevated EC increases soluble aluminum/manganese activity and osmotic root stress.';
    recommendations.push(
      'Flush excess salts with low-EC water and apply agricultural lime/dolomite amendment in measured doses.'
    );
  } else if (current.ph < thresholds.phMin) {
    phAndEcAssessment =
      'Acidic rhizosphere conditions can restrict phosphorus, calcium, and magnesium availability.';
    recommendations.push(
      'Consider buffered agricultural lime application and re-sample pH after 48 hours.'
    );
  } else if (current.ph > thresholds.phMax) {
    phAndEcAssessment =
      'Alkaline soil pH may limit iron, manganese, and zinc availability around feeder roots.';
    recommendations.push(
      'Apply elemental sulfur or organic compost acidification and monitor chelated micronutrient uptake.'
    );
  } else if (current.ec > thresholds.ecMax) {
    phAndEcAssessment =
      'High EC indicates elevated soluble salts, which can increase osmotic pressure and reduce water uptake.';
    recommendations.push(
      'Reduce fertilizer fertigation concentration and schedule a controlled leaching irrigation cycle.'
    );
  } else if (current.ec < thresholds.ecMin) {
    phAndEcAssessment =
      'Low EC indicates depleted dissolved ionic nutrients in root-zone pore water.';
    recommendations.push(
      'Introduce a balanced NPK fertigation pulse matched to crop growth stage.'
    );
  }

  if (current.temperature > thresholds.tempMax) {
    recommendations.push(
      'Apply organic surface mulch or schedule cooling irrigation during early morning hours to lower root-zone heat.'
    );
  } else if (current.temperature < thresholds.tempMin) {
    recommendations.push(
      'Irrigate during midday warmest window and monitor root-zone thermal recovery.'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Continue automated ESP32 logging at standard intervals and verify sensor calibration monthly.'
    );
  }

  const summaryMap: Record<PlantCondition, string> = {
    Healthy: `Root-zone environment is balanced (Health Score ${evaluation.healthScore}/100). Moisture, pH, EC, and thermal conditions support steady nutrient uptake.`,
    Moderate: `Moderate root-zone stress indicator detected (Health Score ${evaluation.healthScore}/100). One or more soil parameters are drifting from optimal targets and warrant preventive adjustment.`,
    Critical: `Critical root-zone parameter deviation (Health Score ${evaluation.healthScore}/100). Immediate irrigation or soil amendment action is advised to prevent visible crop stress.`,
  };

  return {
    classification: evaluation.overallCondition,
    confidenceLabel: 'Simulated AI Analysis (Heuristic Rule Engine · Ready for ML/API)',
    summary: summaryMap[evaluation.overallCondition],
    abnormalReadings,
    trendObservations,
    irrigationRequirement,
    phAndEcAssessment,
    recommendations,
    disclaimer:
      'AI-assisted simulated analysis evaluates physical/chemical root-zone measurements only and does not diagnose biological plant or root diseases.',
  };
}

export function generateInitialLiveHistory(base: SensorReading): SensorReading[] {
  const points: SensorReading[] = [];
  const now = Date.now();
  for (let i = 11; i >= 0; i--) {
    const t = new Date(now - i * 60000);
    const label = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const wave = Math.sin(i * 0.6);
    points.push({
      timestamp: t.toISOString(),
      label,
      moisture: +(base.moisture + wave * 1.4).toFixed(1),
      ph: +(base.ph + Math.cos(i * 0.4) * 0.08).toFixed(2),
      temperature: +(base.temperature + Math.sin(i * 0.35) * 0.6).toFixed(1),
      ec: +(base.ec + Math.cos(i * 0.5) * 0.06).toFixed(2),
    });
  }
  return points;
}

export function generateTimeframeDataset(
  timeframe: 'daily' | 'weekly' | 'monthly'
): SensorReading[] {
  const rows: SensorReading[] = [];
  if (timeframe === 'daily') {
    for (let h = 0; h < 24; h++) {
      const hh = h.toString().padStart(2, '0') + ':00';
      const diurnal = Math.sin(((h - 6) / 24) * Math.PI * 2);
      rows.push({
        timestamp: `2026-11-25T${hh}:00Z`,
        label: hh,
        moisture: +(54 - diurnal * 4.5 + (h === 6 ? 6 : 0)).toFixed(1),
        ph: +(6.45 + Math.cos(h * 0.3) * 0.12).toFixed(2),
        temperature: +(22.5 + diurnal * 3.8).toFixed(1),
        ec: +(1.72 + Math.sin(h * 0.45) * 0.16).toFixed(2),
      });
    }
  } else if (timeframe === 'weekly') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((day, idx) => {
      rows.push({
        timestamp: `2026-11-${19 + idx}T12:00:00Z`,
        label: day,
        moisture: +(56 - idx * 2.1 + (idx === 4 ? 11 : 0)).toFixed(1),
        ph: +(6.5 - idx * 0.04 + (idx === 5 ? 0.15 : 0)).toFixed(2),
        temperature: +(21.8 + Math.sin(idx * 0.8) * 2.4).toFixed(1),
        ec: +(1.65 + idx * 0.07 - (idx === 4 ? 0.18 : 0)).toFixed(2),
      });
    });
  } else {
    for (let d = 1; d <= 30; d++) {
      const label = `Day ${d}`;
      const cycle = d % 5;
      rows.push({
        timestamp: `2026-11-${d.toString().padStart(2, '0')}T12:00:00Z`,
        label,
        moisture: +(48 + (5 - cycle) * 3.2 + Math.sin(d * 0.4) * 2.1).toFixed(1),
        ph: +(6.4 + Math.sin(d * 0.25) * 0.25).toFixed(2),
        temperature: +(22.0 + Math.cos(d * 0.22) * 3.1).toFixed(1),
        ec: +(1.55 + (cycle === 1 ? 0.38 : 0.12) + Math.sin(d * 0.3) * 0.14).toFixed(2),
      });
    }
  }
  return rows;
}

export function exportReadingsToCSV(rows: SensorReading[], filename: string): void {
  const headers = [
    'Timestamp',
    'Label',
    'Soil Moisture (%)',
    'Soil pH',
    'Soil Temperature (C)',
    'Soil EC (mS/cm)',
  ];
  const csvLines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        `"${r.timestamp}"`,
        `"${r.label}"`,
        r.moisture.toFixed(1),
        r.ph.toFixed(2),
        r.temperature.toFixed(1),
        r.ec.toFixed(2),
      ].join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
