<template>
  <main>
    <div class="container">
      <div v-if="isLoading" class="spinner">
        <BaseSpinner />
      </div>
      <div v-else>
        <h2>Tasks by Status</h2>
        <div class="chart">
          <Bar :data="chartData" :options="options"/>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore';
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale
} from 'chart.js'
import { TASK_STATUSES, TaskStatusColor, type TaskStatus } from '@/types/task';
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import BaseSpinner from '@/components/ui/spinners/BaseSpinner.vue';

ChartJS.register(BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale)
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 24
        }
      }
    },
    y: {
      ticks: {
        font: {
          size: 24 
        }
      }
    }
  }
}

const taskStore = useTaskStore();
const { tasks, isLoading } = storeToRefs(taskStore);
const chartData = computed(() => {
  const data = Object.fromEntries(TASK_STATUSES.map(key => [key, 0])) as { [key in TaskStatus]: number };

  [...tasks.value].forEach((task) => {
    data[task.status] = (data[task.status] || 0) + 1;
  })
  return {
    labels: [...TASK_STATUSES],
    datasets: [{
      label: 'Tasks by Status', 
      data: Object.values(data) || [],
      backgroundColor: Object.values(TaskStatusColor),
    }],
  };
})

onMounted(async () => {
  await taskStore.fetchTasks();
});
</script>

<style scoped lang="scss">
  .spinner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart {
    margin-top: 48px;
    background-color: var(--secondary-color);
    border-radius: 16px;
    padding: 48px;
  }

  h2 {
    text-align: center;
  }

</style>