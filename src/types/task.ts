export const TASK_STATUSES = ['To Do', 'In Progress', 'Done'] as const;
export const TASK_SORTABLE_FIELDS = ['id', 'name', 'status', 'assignee', 'dueDate'] as const;

export const TaskStatusColor: Record<TaskStatus, string> = {
  'To Do': '#1290E0',
  'In Progress': '#E16B16',
  'Done': '#008844'
};

export type TaskStatus = typeof TASK_STATUSES[number];
export type TaskSortKey = typeof TASK_SORTABLE_FIELDS[number];

export interface Task {
  id: string;
  projectId: string;
  name: string;
  assignee: string;
  status: TaskStatus;
  dueDate: string; 
  position?: number;
}