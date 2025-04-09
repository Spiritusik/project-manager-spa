
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { type Project, PROJECT_STATUSES } from '@/types/project';
import ModalWrapper from './ModalWrapper.vue'

const { onClose, onConfirm } = defineProps<{
  onClose: () => void;
  onConfirm: (project: Omit<Project, 'id' | 'createdAt' | 'tasksCount'>) => Promise<void>;
}>();

const form = reactive({
  name: '',
  description: '',
  status: PROJECT_STATUSES[0],
});

const error = ref('');
const isLoading = ref(false);

const handleSubmit = async () => {
  isLoading.value = true;
  if (!form.name.trim()) {
    error.value = 'Назва обовʼязкова';
    return;
  }

  try {
    await onConfirm({ ...form });
    error.value = '';
    form.name = '';
    form.description = '';
    form.status = PROJECT_STATUSES[0];
    onClose();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася невідома помилка';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <ModalWrapper @close="onClose">
    <form @submit.prevent="handleSubmit">
      <div>
        <label>Назва проєкту *</label>
        <input v-model="form.name" />
      </div>

      <div>
        <label>Опис</label>
        <textarea v-model="form.description" />
      </div>

      <div class="row">
        <label>Статус</label>
        <select v-model="form.status">
          <option v-for="status in PROJECT_STATUSES" :key="status" :value="status">
            {{ status }}
          </option>
        </select>
      </div>

      <p v-if="error" style="color: red">{{ error }}</p>

      <div class="row space-between">
        <button @click="onClose">Закрити</button>
        <button type="submit">Зберегти</button>
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
  textarea {
    padding: 8px 12px;
    width: 100%;
  }

  textarea {
    resize: none;
  }

  label {
    & + select {
      margin-left: 15px;
    }
  }

  button {
    margin-top: 15px;
  }
</style>