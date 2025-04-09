import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { taskService } from '@/services/taskService';
import type { Task } from '@/types/task';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';

const LOCAL_KEY = 'tasks';

export const useTaskStore = defineStore('taskStore', () => {
  const tasks = ref<Task[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchTasks = async () => {
    const fromLocal = loadFromStorage<Task[]>(LOCAL_KEY);
    if (fromLocal) {
      tasks.value = fromLocal;
      return;
    }

    try {
      isLoading.value = true;
      const res = await taskService.getAll();
      tasks.value = res.data;
      saveToStorage(LOCAL_KEY, tasks.value);
    } catch (err) {
      error.value = 'Failed to fetch tasks';
    } finally {
      isLoading.value = false;
    }
  }

  // const fetchTasksByProject = async (projectId: string) => {
  //   const fromLocal = loadFromStorage<Task[]>(LOCAL_KEY);
  //   if (fromLocal) {
  //     tasks.value = fromLocal;
  //     return;
  //   }

  //   try {
  //     isLoading.value = true;
  //     const res = await taskService.getByProjectId(projectId);
  //     tasks.value = res.data;
  //     saveToStorage(LOCAL_KEY, tasks.value);
  //   } catch (err) {
  //     error.value = 'Failed to fetch tasks';
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  const fetchTasksByProject = (projectId: string) => computed(() => tasks.value.filter((task: Task) => task.projectId === projectId));

  const addTask = async (task: Omit<Task, 'id'>) => {
    const res = await taskService.create(task);
    tasks.value.push(res.data);
    saveToStorage(LOCAL_KEY, tasks.value);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await taskService.update(id, updates);
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) tasks.value[index] = res.data;
    saveToStorage(LOCAL_KEY, tasks.value);
  };

  const deleteTask = async (id: string) => {
    await taskService.delete(id);
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveToStorage(LOCAL_KEY, tasks.value);
  };

  const tasksCountByProject = computed(() => {
    const map = new Map<string, number>();
    tasks.value.forEach(task => {
      map.set(task.projectId, (map.get(task.projectId) || 0) + 1);
    });
    return map;
  });

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    fetchTasksByProject,
    addTask,
    updateTask,
    deleteTask,
    tasksCountByProject,
  };
});
