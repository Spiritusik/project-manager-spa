<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useProjectStore } from '@/stores/projectStore';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useTaskStore } from '@/stores/taskStore';
  import { TASK_STATUSES, type Task, type TaskSortKey, type TaskStatus } from '@/types/task';
  import CustomTable from '@/components/tables/CustomTable.vue';
  import TaskModal from '@/components/modals/TaskModal.vue'
import CustomSelect from '@/components/ui/selects/CustomSelect.vue';
import BaseSpinner from '@/components/ui/spinners/BaseSpinner.vue';
import { useDialog } from '@/composables/useDialog';
import type { Project } from '@/types/project';
import ProjectModal from '@/components/modals/ProjectModal.vue';

type TaskColumn = {
  key: keyof Task | 'tasksCount';
  label: string;
  sortable?: boolean;
  width?: number;
};

const taskColumns: TaskColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: 50 },
  { key: 'name', label: 'Name', sortable: true, width: 75 },
  { key: 'assignee', label: 'Assignee', sortable: true, width: 75 },
  // { key: 'status', label: 'Status', sortable: true },
  { key: 'dueDate', label: 'Deadline', sortable: true, width: 100  },
];

  const route = useRoute();
  const projectId = String(route.params.id);

  const projectStore = useProjectStore();
  const taskStore = useTaskStore();

  const { projects, isLoading: isProjectsLoading } = storeToRefs(projectStore);
  const { isLoading: isTasksLoading } = storeToRefs(taskStore);
  const tasks = taskStore.fetchTasksByProject(projectId);

  const project = computed(() => projectStore.getProjectById(projectId));

  const search = ref('');
  const filterStatus = ref('');
  const taskModal = useDialog<Task>()
  const projectModal = useDialog<Project>()

  const filteredTasks = computed(() => {
    return tasks.value.filter(task => {
      const matchesName = task?.assignee.toLowerCase().includes(search.value.toLowerCase());
      if(filterStatus.value === '') return matchesName;
      if(filterStatus.value !== task.status) return true;
      return matchesName;
    })
  })


  const getTasksByStatus = (status: string) => {
    return filteredTasks.value.filter(task => task.status === status);
  };

  const handleDrop = async ({ item, toGroup }: { item: Task; toGroup: string }) => {
    if (item.status === toGroup) return;
    
    if (!TASK_STATUSES.includes(toGroup as TaskStatus)) {
      console.warn('Недопустимий статус:', toGroup);
      return;
    }
    
    const status = toGroup as TaskStatus;

    try {
      await taskStore.updateTask(item.id, { ...item, status });
      await taskStore.fetchTasksByProject(projectId);
    } catch (err) {
      console.error('Не вдалося оновити статус', err);
    }
  };

  const handleProjectEdit = () => {
    projectModal.handleOpen(project.value);
  }

  onMounted(async () => {
    if (!projects.value.length) {
      await projectStore.fetchProjects();
    }
    await taskStore.fetchTasks();
  });
</script>

<template>
  <main>
    <div class="container">
      <div v-if="isProjectsLoading || isTasksLoading" class="spinner">
        <BaseSpinner />
      </div>
      <div v-else>
        <div class="row justify-between align-center">
          <h1>Project: {{ project && project.name }}</h1>
          <button @click="handleProjectEdit" class="btn--primary">Edit Project</button>
        </div>
        <p class="description" v-if="project?.description">{{ project?.description }}</p>

        <div class="filters-container">
          <div class="filters">
            <input
              v-model="search"
              type="text"
              placeholder="Search by name"
              class="filters__input"
            />
  
            <CustomSelect rounded="right" class="filters__select" v-model="filterStatus">
              <option class="filters__option" value="">All statuses</option>
              <option class="filters__option" v-for="status in TASK_STATUSES" :key="status" :value="status">
                {{ status }}
              </option>
            </CustomSelect>
          </div>
          <button class="btn--primary" @click="taskModal.handleOpen()">Create Task</button>
        </div>
        
        <div class="table-list">
          <div class="status-section" v-for="status in TASK_STATUSES" :key="status">
            <h4>{{ status }}</h4>
            <div class="table-container">
              <CustomTable
                :data="getTasksByStatus(status)"
                :columns="taskColumns"
                :draggable="true"
                :group="status"
                @drop="handleDrop"
                @click:item="(payload) => taskModal.handleOpen(payload.item)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <TaskModal 
    v-if="taskModal.open.value" 
    :project-id="projectId"
    :on-close="taskModal.handleClose"
    :task="taskModal.data.value"
  />

  <ProjectModal 
    v-if="projectModal.open.value"
    :on-close="projectModal.handleClose"
    :project="projectModal.data.value"
  />
</template>

<style scoped lang="scss">
.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.filters {
  display: flex;
  flex-grow: 1;

  &__input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    flex-grow: 1;
    max-width: 300px;
  }

  &__option {
    color: var(--primary-color);
    background-color: var(--secondary-color);
  }
}

.filters-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 24px;
  gap: 16px 60px;
}

.table-container {
  max-width: 100%;
  flex-grow: 1;
  margin-top: 24px;
}

.table-list {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px
}

.status-section {
  flex-grow: 1;

  margin-top: 24px;
  border-radius: 16px;
  padding: 16px;
  width: 0;
  max-width: fit-content;
  flex-basis: 300px;
  background-color: var(--secondary-color);
}

.description {
  margin-top: 25px;
}
</style>
