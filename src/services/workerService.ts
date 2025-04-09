import { api } from './api';
import type { Worker } from '@/types/worker';

export const workerService = {
  getAll: () => api.get<Worker[]>('/workers'),
  create: (worker: Omit<Worker, 'id'>) => api.post<Worker>('/workers', worker),
  update: (id: string, worker: Partial<Worker>) =>
    api.put<Worker>(`/workers/${id}`, worker),
  delete: (id: string) => api.delete(`/workers/${id}`),
};
