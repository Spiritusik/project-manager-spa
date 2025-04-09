import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { projectService } from '@/services/projectService';
import type { Project } from '@/types/project';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';
import { useTaskStore } from './taskStore';

const LOCAL_KEY = 'projects';

export const useProjectStore = defineStore('projectStore', () => {
  const projects = ref<Project[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const taskStore = useTaskStore();

  const fetchProjects = async () => {
    const fromLocal = loadFromStorage<Project[]>(LOCAL_KEY);
    if (fromLocal) {
      projects.value = fromLocal;
      return;
    }

    try {
      isLoading.value = true;
      const res = await projectService.getAll();
      projects.value = res.data;
      saveToStorage(LOCAL_KEY, projects.value);
    } catch (err) {
      error.value = 'Failed to fetch projects';
    } finally {
      isLoading.value = false;
    }
  };

  const addProject = async (newProject: Omit<Project, 'id' | 'createdAt' | 'tasksCount'>) => {
    const res = await projectService.create(newProject);
    projects.value.push(res.data);
    saveToStorage(LOCAL_KEY, projects.value);
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const res = await projectService.update(id, updates);
    const index = projects.value.findIndex(p => p.id === id);
    if (index !== -1) projects.value[index] = res.data;
    saveToStorage(LOCAL_KEY, projects.value);
  };

  const deleteProject = async (id: string) => {
    await projectService.delete(id);
    projects.value = projects.value.filter(p => p.id !== id);
    saveToStorage(LOCAL_KEY, projects.value);
  };

  const getProjectById = (id: string) => projects.value.find(p => p.id === id);
  
  const projectsWithCount = computed(() =>
    projects.value.map(project => ({
      ...project,
      tasksCount: taskStore.tasksCountByProject.get(project.id) || 0
    }))
  );

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    projectsWithCount,
  };
});
