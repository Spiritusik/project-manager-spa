import { api } from './api';
import type { Task } from '@/types/task';

export const taskService = {
  getAll: () => api.get<Task[]>('/tasks'),
  getByProjectId: (projectId: string) =>
    api.get<Task[]>(`/tasks?projectId=${projectId}`),
  create: (task: Omit<Task, 'id'>) => api.post<Task>('/tasks', task),
  update: (id: string, task: Partial<Task>) =>
    api.put<Task>(`/tasks/${id}`, task),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};
