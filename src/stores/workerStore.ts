import { defineStore } from 'pinia';
import { ref } from 'vue';
import { workerService } from '@/services/workerService';
import type { Worker } from '@/types/worker';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';

const LOCAL_KEY = 'workers';

export const useWorkerStore = defineStore('workerStore', () => {
  const workers = ref<Worker[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchWorkers = async () => {
    const fromLocal = loadFromStorage<Worker[]>(LOCAL_KEY);
    if (fromLocal) {
      workers.value = fromLocal;
      return;
    }

    try {
      isLoading.value = true;
      const res = await workerService.getAll();
      workers.value = res.data;
      saveToStorage(LOCAL_KEY, workers.value);
    } catch (err) {
      error.value = 'Failed to fetch workers';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    workers,
    isLoading,
    error,
    fetchWorkers,
  };
});
