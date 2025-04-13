<script setup lang="ts">
  import { type Project, PROJECT_STATUSES } from '@/types/project';
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProjectStore } from '@/stores/projectStore';
  import { storeToRefs } from 'pinia';
  import { useTaskStore } from '@/stores/taskStore';
  import ProjectModal from '@/components/modals/ProjectModal.vue'
  import CustomTable from '@/components/tables/CustomTable.vue';
  import BaseSpinner from '@/components/ui/spinners/BaseSpinner.vue';
import CustomSelect from '@/components/ui/selects/CustomSelect.vue';
import { useDialog } from '@/composables/useDialog';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';

  interface ProjectColumn {
    key: keyof Project | 'tasksCount';
    label: string;
    sortable?: boolean;
    width?: number;
  };

  const projectColumns: ProjectColumn[] = [
    { key: 'id', label: 'ID', sortable: true, width: 100 },
    { key: 'name', label: 'Name', sortable: true, width: 150 },
    { key: 'status', label: 'Status', sortable: true, width: 100 },
    { key: 'tasksCount', label: 'Tasks Count', sortable: true, width: 150 },
    { key: 'createdAt', label: 'Created At', sortable: true, width: 200  },
  ];

  const router = useRouter();
  const projectStore = useProjectStore();
  const taskStore = useTaskStore();
  const { projectsWithCount: projects , isLoading } = storeToRefs(projectStore);
  const STORAGE_KEY = `ProjectView`

  const searchName = ref('');
  const filterStatus = ref('');
  const projectModal = useDialog<Project>()

  const filteredProjects = computed(() => {
    return projects.value.filter(project => {
      const matchesName = project.name.toLowerCase().includes(searchName.value.toLowerCase());
      const matchesStatus = filterStatus.value ? project.status === filterStatus.value : true;
      return matchesName && matchesStatus;
    })
  })

  const onClick = ({ item }: { item: Project }) => {
    router.push(`/projects/${item.id}`)
  }
  
  watch([searchName, filterStatus], () => {
    saveToStorage(`${STORAGE_KEY}:filters`, {
      search: searchName.value,
      filterStatus: filterStatus.value,
    });
  });

  onMounted(async () => {
    const savedFilters = loadFromStorage<{ search: string; filterStatus: string }>(`${STORAGE_KEY}:filters`);
    if (savedFilters) {
      searchName.value = savedFilters.search;
      filterStatus.value = savedFilters.filterStatus;
    }
    await projectStore.fetchProjects();
    await taskStore.fetchTasks();
  });
</script>

<template>
  <main>
    <div class="container">
      <div class="row justify-between align-center">
        <h1>Projects</h1>
        <button class="btn--primary" @click="projectModal.handleOpen()">Create Project</button>

      </div>
      <div v-if="isLoading" class="spinner">
        <BaseSpinner />
      </div>
      <div v-else>
        <div class="filters">
          <input
            v-model="searchName"
            type="text"
            placeholder="Search by name"
            class="filters__input"
          />

          <CustomSelect class="filters__select" v-model="filterStatus">
            <option class="filters__option" value="">All statuses</option>
            <option class="filters__option" v-for="status in PROJECT_STATUSES" :key="status" :value="status">
              {{ status }}
            </option>
          </CustomSelect>
        </div>
        
        <div class="table-container">
          <CustomTable
            :data="filteredProjects"
            :columns="projectColumns"
            :storage-key="`${STORAGE_KEY}:CustomTable`"
            @click:item="onClick"
          />
        </div>
      </div>
    </div>
  </main>

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
  gap: 24px;

  margin-top: 24px;

  &__input {
    flex-grow: 1;
    max-width: 300px;
  }

  &__option {
    color: var(--primary-color);
    background-color: var(--secondary-color);
  }
}

.table-container {
  margin-top: 24px;
}
</style>