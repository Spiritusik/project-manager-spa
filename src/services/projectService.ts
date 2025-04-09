import { api } from './api';
import type { Project } from '@/types/project';

export const projectService = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (project: Omit<Project, 'id' | 'createdAt' | 'tasksCount'>) =>
    api.post<Project>('/projects', {
      ...project,
      createdAt: new Date().toISOString(),
    }),
  update: (id: string, project: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, project),
  delete: (id: string) => api.delete(`/projects/${id}`),
};
