export type {
  Vector3,
  ServiceStatus,
  HealthDependencies,
} from './types/common';

export type {
  HealthCheckResponse,
} from './types/health';

export type {
  PlayerState,
  PlayerInitRequest,
  PlayerUpdateRequest,
} from './types/player';

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<TData> {
  status: 'ok';
  data: TData;
}

export type CampusZoneId =
  | 'main-plaza'
  | 'library'
  | 'classroom-building'
  | 'club-house'
  | 'cafeteria'
  | 'dormitory'
  | 'sports-field'
  | 'administration-office'
  | 'underground-data-center';

export type QuestStatus =
  | 'locked'
  | 'available'
  | 'active'
  | 'completed'
  | 'failed';

export type NPCMood =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'worried'
  | 'mysterious';
