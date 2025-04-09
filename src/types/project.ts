export const PROJECT_STATUSES = ['Active', 'Archived', 'Completed'] as const;
export const PROJECT_SORTABLE_FIELDS = ['id', 'name', 'status', 'tasksCount', 'createdAt'] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number];
export type ProjectSortKey = typeof PROJECT_SORTABLE_FIELDS[number];

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  tasksCount?: number;
}