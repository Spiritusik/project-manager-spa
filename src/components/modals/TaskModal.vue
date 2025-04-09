<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import ModalWrapper from './ModalWrapper.vue'
import { TASK_STATUSES, type Task } from '@/types/task';
import { useWorkerStore } from '@/stores/workerStore';

const { onClose, onConfirm, projectId } = defineProps<{
  onClose: () => void;
  onConfirm: (task: Omit<Task, 'id'>) => Promise<void>;
  projectId: string;
}>();

const form = reactive({
  projectId,
  name: '',
  assignee: '',
  status: TASK_STATUSES[0],
  dueDate: '',
});

const error = ref('');

const workerStore = useWorkerStore();
const workers = computed(() => workerStore.workers);
const isLoading = computed(() => workerStore.isLoading);

const handleSubmit = async () => {
  if (!form.name.trim() || !form.assignee.trim() || !form.dueDate) {
    error.value = 'Усі поля (крім статусу) обовʼязкові';
    return;
  }

  try {
    await onConfirm({ ...form });
    error.value = '';
    form.name = '';
    form.assignee = '';
    form.status = TASK_STATUSES[0];
    form.dueDate = '';
    onClose();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася невідома помилка';
  }
};

onMounted(async () => {
  await workerStore.fetchWorkers();
});
</script>

<template>
  <ModalWrapper @close="onClose">
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Назва завдання *</label>
        <input v-model="form.name" />
      </div>

      <div>
        <label>Виконавець *</label>
        <select v-model="form.assignee" :disabled="isLoading">
          <option value="" disabled>Оберіть виконавця</option>
          <option v-for="worker in workers" :key="worker.id" :value="worker.name">
            {{ worker.name }}
          </option>
        </select>
      </div>

      <div>
        <label>Статус</label>
        <select v-model="form.status">
          <option v-for="status in TASK_STATUSES" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <div>
        <label>Термін виконання *</label>
        <input v-model="form.dueDate" type="date" />
      </div>

      <p v-if="error" style="color: red">{{ error }}</p>

      
      <div class="row space-between">
        <button @click="onClose">Закрити</button>
        <button :disabled="isLoading" type="submit">Зберегти</button>
      </div>
    </form>
  </ModalWrapper>
</template>

<style scoped lang="scss">
form {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input,
select,
textarea {
  padding: 8px 12px;
  width: 100%;
}

textarea {
  resize: none;
}


select {
  option[value=""] {
    display: none;
  }
}

button {
  margin-top: 15px;
}
</style>
