import axios, { AxiosError } from 'axios';
import type { 
  HealthCheckResponse, 
  PlayerState, 
  PlayerInitRequest, 
  PlayerUpdateRequest 
} from '@campus-quest/shared-types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

export const healthApi = {
  check: async (): Promise<HealthCheckResponse> => {
    const { data } = await apiClient.get<HealthCheckResponse>('/health');
    return data;
  },
};

export const playerApi = {
  init: async (playerId: string, name?: string): Promise<PlayerState> => {
    const payload: PlayerInitRequest = { playerId, name };
    const { data } = await apiClient.post<PlayerState>('/player/init', payload);
    return data;
  },

  updateState: async (playerId: string, state: PlayerUpdateRequest): Promise<PlayerState> => {
    const { data } = await apiClient.patch<PlayerState>(`/player/${playerId}/state`, state);
    return data;
  },

  getState: async (playerId: string): Promise<PlayerState> => {
    const { data } = await apiClient.get<PlayerState>(`/player/${playerId}`);
    return data;
  },
};

export default apiClient;
