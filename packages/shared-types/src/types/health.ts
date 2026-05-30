import type { HealthDependencies, ServiceStatus } from './common';

export interface HealthCheckResponse {
  service: string;
  status: ServiceStatus;
  timestamp: string;
  version?: string;
  environment?: string;
  dependencies?: HealthDependencies;
}