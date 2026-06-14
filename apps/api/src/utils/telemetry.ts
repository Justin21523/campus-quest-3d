// apps/api/src/utils/telemetry.ts
import type { Request, Response } from 'express';
/**
 * Prometheus-compatible telemetry collector
 * - Tracks sync latency, conflict rates, error distributions
 * - Exposes /metrics endpoint for Prometheus scraping
 */

export interface MetricLabels {
  [key: string]: string | number;
}

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricDefinition {
  name: string;
  type: MetricType;
  help: string;
  labels?: string[];
}

class TelemetryCollector {
  private metrics = new Map<string, {
    definition: MetricDefinition;
    value: number | Map<string, number>;
    buckets?: number[]; // For histogram
  }>();

  /**
   * Register a new metric
   */
  register(def: MetricDefinition): void {
    if (this.metrics.has(def.name)) {
      throw new Error(`Metric ${def.name} already registered`);
    }
    
    this.metrics.set(def.name, {
      definition: def,
      value: def.type === 'histogram' ? new Map() : 0,
      buckets: def.type === 'histogram' ? [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] : undefined,
    });
  }

  /**
   * Increment a counter metric
   */
  inc(name: string, value: number = 1, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.definition.type !== 'counter') return;
    
    const key = labels ? this.labelsToKey(labels) : 'total';
    const current = metric.value instanceof Map ? metric.value.get(key) || 0 : metric.value;
    
    if (metric.value instanceof Map) {
      metric.value.set(key, current + value);
    } else {
      metric.value = current + value;
    }
  }

  /**
   * Set a gauge metric
   */
  set(name: string, value: number, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.definition.type !== 'gauge') return;
    
    const key = labels ? this.labelsToKey(labels) : 'total';
    if (metric.value instanceof Map) {
      metric.value.set(key, value);
    } else {
      metric.value = value;
    }
  }

  /**
   * Observe a histogram value
   */
  observe(name: string, value: number, labels?: MetricLabels): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.definition.type !== 'histogram') return;
    
    const key = labels ? this.labelsToKey(labels) : 'total';
    const bucketCounts = metric.value as Map<string, number>;
    
    // Increment all buckets >= value
    metric.buckets?.forEach(bucket => {
      if (value <= bucket) {
        const bucketKey = `${key}:le${bucket}`;
        bucketCounts.set(bucketKey, (bucketCounts.get(bucketKey) || 0) + 1);
      }
    });
    
    // Also increment sum and count
    bucketCounts.set(`${key}:sum`, (bucketCounts.get(`${key}:sum`) || 0) + value);
    bucketCounts.set(`${key}:count`, (bucketCounts.get(`${key}:count`) || 0) + 1);
  }

  /**
   * Convert labels object to string key
   */
  private labelsToKey(labels: MetricLabels): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  /**
   * Export metrics in Prometheus text format
   */
  export(): string {
    const lines: string[] = [];
    
    for (const [name, { definition, value, buckets }] of this.metrics) {
      // Add HELP and TYPE headers
      lines.push(`# HELP ${name} ${definition.help}`);
      lines.push(`# TYPE ${name} ${definition.type}`);
      
      if (definition.type === 'histogram' && value instanceof Map) {
        // Export histogram buckets
        const baseLabels = definition.labels?.join(',') || '';
        const prefix = baseLabels ? `${name}{${baseLabels},` : `${name}{`;
        
        buckets?.forEach(bucket => {
          const key = `le${bucket}`;
          for (const [fullKey, count] of value.entries()) {
            if (fullKey.endsWith(`:${key}`)) {
              const labels = fullKey.replace(`:${key}`, '');
              lines.push(`${prefix}${labels},le="${bucket}"} ${count}`);
            }
          }
        });
        
        // Export sum and count
        for (const suffix of ['sum', 'count']) {
          for (const [fullKey, val] of value.entries()) {
            if (fullKey.endsWith(`:${suffix}`)) {
              const labels = fullKey.replace(`:${suffix}`, '');
              lines.push(`${prefix}${labels},${suffix}="${suffix}"} ${val}`);
            }
          }
        }
      } else if (value instanceof Map) {
        // Export labeled counter/gauge
        const prefix = definition.labels?.length ? `${name}{` : `${name}`;
        for (const [labels, val] of value.entries()) {
          const labelStr = definition.labels?.length ? `${labels}` : '';
          lines.push(`${prefix}${labelStr}${definition.labels?.length ? '}' : ''} ${val}`);
        }
      } else {
        // Export simple counter/gauge
        lines.push(`${name} ${value}`);
      }
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

// Singleton instance
export const telemetry = new TelemetryCollector();

// Register default metrics
telemetry.register({
  name: 'player_sync_requests_total',
  type: 'counter',
  help: 'Total number of player sync requests',
  labels: ['status', 'playerId'],
});

telemetry.register({
  name: 'player_sync_latency_seconds',
  type: 'histogram',
  help: 'Latency of player sync operations',
  labels: ['operation'],
});

telemetry.register({
  name: 'quest_transitions_total',
  type: 'counter',
  help: 'Total quest state transitions',
  labels: ['questId', 'fromStatus', 'toStatus', 'result'],
});

telemetry.register({
  name: 'active_players_gauge',
  type: 'gauge',
  help: 'Number of active players (heartbeat within 5min)',
});

/**
 * Express middleware to expose /metrics endpoint
 */
export function metricsMiddleware(req: Request, res: Response) {
  if (req.path !== '/metrics') {
    return res.status(404).send('Not found');
  }
  
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(telemetry.export());
}