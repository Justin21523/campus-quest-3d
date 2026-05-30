export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type ServiceStatus = 'ok' | 'error' | 'degraded' | 'unknown';

export interface HealthDependencies {
  aiService?: ServiceStatus;
  database?: ServiceStatus;
  [key: string]: ServiceStatus | undefined;
}