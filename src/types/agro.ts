export type PageId =
  | 'home'
  | 'dashboard'
  | 'root-zone'
  | 'hardware'
  | 'reports'
  | 'settings';

export type OperationMode = 'demo' | 'live';

export type PlantCondition = 'Healthy' | 'Moderate' | 'Critical';

export type AlertSeverity = 'nominal' | 'advisory' | 'warning' | 'critical';

export interface SensorReading {
  timestamp: string;
  label: string;
  moisture: number; // % (0 - 100)
  ph: number; // pH (3.5 - 9.5)
  temperature: number; // °C (5 - 48)
  ec: number; // mS/cm (0.1 - 5.0)
}

export interface SensorThresholds {
  moistureMin: number;
  moistureMax: number;
  phMin: number;
  phMax: number;
  tempMin: number;
  tempMax: number;
  ecMin: number;
  ecMax: number;
}

export interface SensorCalibration {
  moistureOffset: number;
  phOffset: number;
  tempOffset: number;
  ecMultiplier: number;
  samplingIntervalSec: number;
  enabledSensors: {
    moisture: boolean;
    ph: boolean;
    temperature: boolean;
    ec: boolean;
  };
}

export interface ParameterEvaluation {
  status: string;
  severity: AlertSeverity;
  score: number;
  detail: string;
}

export interface RootZoneEvaluation {
  healthScore: number;
  overallCondition: PlantCondition;
  moisture: ParameterEvaluation;
  ph: ParameterEvaluation;
  temperature: ParameterEvaluation;
  ec: ParameterEvaluation;
}

export interface RootZoneAlert {
  id: string;
  code: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  parameter: 'moisture' | 'ph' | 'temperature' | 'ec' | 'system';
  valueLabel: string;
  timestamp: string;
}

export interface AIAnalysisReport {
  classification: PlantCondition;
  confidenceLabel: string;
  summary: string;
  abnormalReadings: string[];
  trendObservations: string[];
  irrigationRequirement: string;
  phAndEcAssessment: string;
  recommendations: string[];
  disclaimer: string;
}

export interface HardwareComponentInfo {
  id: string;
  name: string;
  category: 'Controller' | 'Sensing Probe' | 'Display & Power' | 'Interconnect';
  model: string;
  image: string;
  imageFocus: string;
  operatingVoltage: string;
  interfaceType: string;
  esp32Connection: string;
  purpose: string;
  workingPrinciple: string;
}

export interface ArchitectureStage {
  id: string;
  step: string;
  title: string;
  shortLabel: string;
  protocol: string;
  latency: string;
  description: string;
  payloadExample: string;
}

export interface DeviceConfig {
  deviceId: string;
  firmwareVersion: string;
  wifiSsid: string;
  wifiRssiDbm: number;
  apiEndpoint: string;
  mqttBroker: string;
  mqttTopic: string;
}
