<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import ModalWrapper from './ModalWrapper.vue'
import { TASK_STATUSES, type Task } from '@/types/task';
import { useWorkerStore } from '@/stores/workerStore';
import { useTaskStore } from '@/stores/taskStore';
import CustomSelect from '../ui/selects/CustomSelect.vue';

const props = defineProps<{
  onClose: () => void;
  projectId: string;
  task?: Task,
}>();

const form = reactive({
  projectId: props.projectId,
  name: props.task?.name || '',
  assignee: props.task?.assignee || '',
  status: props.task?.status || TASK_STATUSES[0],
  dueDate: props.task?.dueDate || '',
});

const error = ref('');
const isLoading = ref(false);

const taskStore = useTaskStore();
const workerStore = useWorkerStore();
const workers = computed(() => workerStore.workers);
const isWorkersLoading = computed(() => workerStore.isLoading);

const closeForm = () => {
  error.value = '';
  form.name = '';
  form.assignee = '';
  form.status = TASK_STATUSES[0];
  form.dueDate = '';
  props.onClose();
}

const handleSubmit = async () => {
  if (!form.name.trim() || !form.assignee.trim() || !form.dueDate) {
    error.value = 'All fields are required';
    return;
  }

  try {
    isLoading.value = true;
    props.task?.id
      ? await taskStore.updateTask(props.task.id, { ...props.task, ...form })
      : await taskStore.addTask({ ...form });
      
    closeForm();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async () => {
  try {
    props.task?.id && await taskStore.deleteTask(props.task?.id);

    closeForm();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unknown error occurred.';
  }
}

onMounted(async () => {
  await workerStore.fetchWorkers();
});
</script>

<template>
  <ModalWrapper @close="closeForm">
    <form class="form" @submit.prevent="handleSubmit">
      <div class="row align-center justify-between gap-1">
        <h4>{{ props.task ? 'Edit' : 'Create' }} Task</h4>
        <button @click="handleDelete" v-if="props.task" class="btn--error">Delete</button>
      </div>
      <div>
        <label>Task Name*</label>
        <input v-model="form.name" />
      </div>

      <div>
        <label>Assignee*</label>
        <CustomSelect class="form__select" v-model="form.assignee" :disabled="isWorkersLoading" variant="secondary">
          <option class="form__option" value="" disabled hidden>Choose one</option>
          <option class="form__option" v-for="worker in workers" :key="worker.id" :value="worker.name">
            {{ worker.name }}
          </option>
        </CustomSelect>
      </div>

      <div>
        <label>Status</label>
        <CustomSelect class="form__select" v-model="form.status" variant="secondary">
          <option v-for="status in TASK_STATUSES" :key="status" :value="status">
            {{ status }}
          </option>
        </CustomSelect>
      </div>

      <div>
        <label>Deadline*</label>
        <input v-model="form.dueDate" type="date" />
      </div>

      <p class="error-message" v-if="error">{{ error }}</p>

      <div class="row justify-between form__footer gap-1">
        <button class="btn--secondary" @click="onClose">Close</button>
        <button class="btn--primary" :disabled="isLoading" type="submit">Save</button>
      </div>
    </form>
  </ModalWrapper>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: 15px;

  &__select {
    width: 100%;
  }

  &__option {
    color: var(--primary-color);
  }

  &__footer {
    margin-top: 15px;

    button {
      width: 100px;
    }
  }
}

input,
select,
textarea {
  width: 100%;
}
</style>
