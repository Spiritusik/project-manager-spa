
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { type Project, PROJECT_STATUSES } from '@/types/project';
import ModalWrapper from './ModalWrapper.vue'
import { useProjectStore } from '@/stores/projectStore';
import CustomSelect from '../ui/selects/CustomSelect.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const props = defineProps<{
  onClose: () => void;
  project?: Project,
}>();

const form = reactive({
  name: props.project?.name || '',
  description: props.project?.description || '',
  status: props.project?.status || PROJECT_STATUSES[0],
});

const error = ref('');
const isLoading = ref(false);

const projectStore = useProjectStore();
const router = useRouter();
const $toast = useToast();

const closeForm = () => {
  error.value = '';
  form.name = '';
  form.description = '';
  form.status = PROJECT_STATUSES[0];
  props.onClose();
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    error.value = 'Name is required';
    return;
  }

  try {
    isLoading.value = true;
    props.project?.id
      ? await projectStore.updateProject(props.project.id, { ...props.project, ...form })
      : await projectStore.addProject({ ...form });
    
    let instance = $toast.success(props.project?.id ? 'Project was updated' : 'Project was created');
    closeForm();
  } catch (err) {
    let instance = $toast.error('Something went wrong. Please refresh the page or try again.');
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async () => {
  try {
    props.project?.id && await projectStore.deleteProject(props.project?.id);

    let instance = $toast.success('Project was deleted');

    closeForm();
    router.push('/projects');
  } catch (err) {
    let instance = $toast.error('Something went wrong. Please refresh the page or try again.');
    error.value = err instanceof Error ? err.message : 'An unknown error occurred.';
  }
}
</script>

<template>
  <ModalWrapper @close="onClose">
    <form class="form" @submit.prevent="handleSubmit">
      <div class="row align-center justify-between gap-1">
        <h4>{{ props.project ? 'Edit' : 'Create' }} Project</h4>
        <button type="button" @click="handleDelete" v-if="props.project" class="btn--error">Delete</button>
      </div>

      <div>
        <label>Project Name*</label>
        <input v-model="form.name" />
      </div>

      <div>
        <label>Description</label>
        <textarea v-model="form.description" />
      </div>

      <div>
        <label>Status</label>
        <CustomSelect class="form__select" variant="secondary"  v-model="form.status">
          <option v-for="status in PROJECT_STATUSES" :key="status" :value="status">
            {{ status }}
          </option>
        </CustomSelect>
      </div>

      <p class="error-message" v-if="error" style="color: red">{{ error }}</p>
      
      <div class="row justify-between form__footer gap-1">
        <button type="button" class="btn--secondary" @click="onClose">Close</button>
        <button type="submit" class="btn--primary" :disabled="isLoading">Save</button>
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