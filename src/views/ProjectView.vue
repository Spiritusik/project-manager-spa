<script setup lang="ts">
  import { type Project, PROJECT_STATUSES } from '@/types/project';
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useProjectStore } from '@/stores/projectStore';
  import { storeToRefs } from 'pinia';
  import { useTaskStore } from '@/stores/taskStore';
  import ProjectModal from '@/components/modals/ProjectModal.vue'
  import CustomTable from '@/components/tables/CustomTable.vue';

  type ProjectColumn = {
    key: keyof Project | 'tasksCount';
    label: string;
    sortable?: boolean;
  };

  const projectColumns: ProjectColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Назва', sortable: true },
    { key: 'status', label: 'Статус', sortable: true },
    { key: 'tasksCount', label: 'К-сть завдань', sortable: true },
    { key: 'createdAt', label: 'Дата створення', sortable: true  },
  ];

  const router = useRouter();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const { projectsWithCount: projects , isLoading } = storeToRefs(projectStore);
  
  const searchName = ref('');
  const filterStatus = ref('');
  const isModalOpen = ref(false);

  const filteredProjects = computed(() => {
    return projects.value.filter(project => {
      const matchesName = project.name.toLowerCase().includes(searchName.value.toLowerCase());
      const matchesStatus = filterStatus.value ? project.status === filterStatus.value : true;
      return matchesName && matchesStatus;
    })
  })

  const closeModal = () => {
    isModalOpen.value = false
  }

  const onClick = ({ item }: { item: Project }) => {
    router.push(`/projects/${item.id}`)
  }

  onMounted(async () => {
    await projectStore.fetchProjects();
    await taskStore.fetchTasks();
  });
</script>

<template>
  <main>
    <div class="container">
      <h1>Проєкти</h1>
      <div v-if="isLoading">Завантаження...</div>
      <div v-else>
        <div class="filters">
          <input
            v-model="searchName"
            type="text"
            placeholder="Пошук за назвою"
          />

          <select v-model="filterStatus">
            <option value="">Усі статуси</option>
            <option v-for="status in PROJECT_STATUSES" :key="status" :value="status">
              {{ status }}
            </option>
          </select>

          <button @click="isModalOpen = true">Open Modal</button>
        </div>
        
        <CustomTable
          :data="filteredProjects"
          :columns="projectColumns"
          @click:item="onClick"
        />
      </div>
    </div>
  </main>
  <ProjectModal v-if="isModalOpen" :on-close="closeModal" :on-confirm="projectStore.addProject"/>
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
</style>