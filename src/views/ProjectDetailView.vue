<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useProjectStore } from '@/stores/projectStore';
  import { storeToRefs } from 'pinia';
  import { useRoute } from 'vue-router';
  import { useTaskStore } from '@/stores/taskStore';
  import { TASK_STATUSES, type Task, type TaskSortKey, type TaskStatus } from '@/types/task';
  import CustomTable from '@/components/tables/CustomTable.vue';
  import TaskModal from '@/components/modals/TaskModal.vue'

type TaskColumn = {
  key: keyof Task | 'tasksCount';
  label: string;
  sortable?: boolean;
  width?: number;
};

const taskColumns: TaskColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Назва', sortable: true },
  { key: 'assignee', label: 'Виконавець', sortable: true },
  { key: 'status', label: 'Статус', sortable: true },
  { key: 'dueDate', label: 'Термін виконання', sortable: true  },
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
  const isModalOpen = ref(false);

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

  const closeModal = () => {
    isModalOpen.value = false
  }

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
      <div v-if="isProjectsLoading || isTasksLoading">Завантаження завдань...</div>
      <div v-else>
        <h1>Проєкт: {{ project && project.name }}</h1>

        <div class="filters">
          <input
            v-model="search"
            type="text"
            placeholder="Пошук за назвою"
          />

          <select v-model="filterStatus">
            <option value="">Усі статуси</option>
            <option v-for="status in TASK_STATUSES" :key="status" :value="status">
              {{ status }}
            </option>
          </select>

          <button @click="isModalOpen = true">Open Modal</button>
        </div>
        
        <div class="table-list">
          <div class="status-section" v-for="status in TASK_STATUSES" :key="status">
            <h2>{{ status }}</h2>
            <CustomTable
              :data="getTasksByStatus(status)"
              :columns="taskColumns"
              :draggable="true"
              :group="status"
              @drop="handleDrop"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
  <TaskModal v-if="isModalOpen" :project-id="project ? project.id : ''" :on-close="closeModal" :on-confirm="taskStore.addTask"/>
</template>

<style scoped lang="scss">
.filters {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;

  input,
  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
}

.table-list {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 25px;
}

.status-section {
  max-width: 100%;
}
</style>
