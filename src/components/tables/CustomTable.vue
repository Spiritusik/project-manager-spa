<script setup lang="ts">
import { defineProps, ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';

type SortOrder = 'asc' | 'desc';

interface Column {
  label: string;
  key: string;
  width?: number;
  sortable?: boolean;
}

type SortKey = typeof props.columns[number]['key'];

const props = defineProps<{
  columns: Column[];
  data: Record<string, any>[];
  draggable?: boolean;
  group?: string;
}>();

const sortKeys = new Set();
const columns = ref(props.columns.map(col => {
  sortKeys.add(col.key);
  return { 
    width: col.width || 100, 
    ...col 
  }
}));
const data = ref(props.data.slice());
const isDraggable = props.draggable ?? false;
const groupName = props.group ?? 'default-table-group';
const sortOrder = ref<SortOrder>('asc');
const sortKey = ref<SortKey>(props.columns[0]['key']);

const sortData = () => {
  if(!sortKey.value) return;

  data.value.sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortOrder.value === 'asc' ? 1 : -1;
    if (bVal == null) return sortOrder.value === 'asc' ? -1 : 1;

    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    const isADate = !isNaN(aDate);
    const isBDate = !isNaN(bDate);

    if (isADate && isBDate) {
      return sortOrder.value === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return sortOrder.value === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
};

const toggleSort = (key: SortKey) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  sortData();
};

const startResize = (e: MouseEvent, colIndex: number) => {
  const startX = e.pageX;
  const startWidth = columns.value[colIndex].width;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.pageX - startX;
    columns.value[colIndex].width = Math.max(50, startWidth + delta);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

watch(
  () => props.data,
  (newData) => {
    data.value = newData.slice();
  },
  { deep: true }
);

const emit = defineEmits<{
  (
    e: 'drop', 
    payload: { 
      item: any; 
      toGroup: string;
    }
  ): void;
  (
    e: 'click:item', 
    payload: { 
      item: any; 
    }
  ): void;
}>();

const onChange = (evt: any) => {
  if (evt.added) {
    emit('drop', {
      item: evt.added.element,
      toGroup: groupName
    });
  }
};

const onClick = (item: any) => {
  emit('click:item', {
    item,
  });
};
</script>

<template>
  <div class="grid-table">
    <div class="row header">
      <template v-for="(col, index) in columns" :key="col.key">
        <div class="cell header-cell" @click="toggleSort(col.key)" :style="{ width: col.width + 'px' }">
          {{ col.label }}
          <div class="resizer" @mousedown.prevent="startResize($event, index)"></div>
        </div>
      </template>
    </div>

    <draggable
      v-if="isDraggable"
      v-model="data"
      :group="{ name: groupName, pull: true, put: true }"
      item-key="id"
      @change="onChange"
    >
      <template #item="{ element, index }">
      <div class="row draggrable">
        <div
          class="cell"
          v-for="(col, colIndex) in columns"
          :key="col.key"
          :style="{ width: col.width + 'px' }"
        >
          {{ element[col.key] }}
          <div class="resizer" @mousedown.prevent="startResize($event, colIndex)"></div>
        </div>
      </div>
    </template>
    </draggable>

    <template v-else>
      <div class="row" v-for="(item, rowIndex) in data" :key="rowIndex" @click="onClick(item)">
        <div
          class="cell"
          v-for="(col, index) in columns"
          :key="col.key"
          :style="{ width: col.width + 'px' }"
        >
          {{ item[col.key] }}
          <div class="resizer" @mousedown="startResize($event, index)"></div>
        </div>
      </div>
    </template>
  </div>
</template>


<style scoped lang="scss">
.grid-table {
  font-family: sans-serif;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: 100%;
}

.row {
  display: flex;

  &:hover {
    background-color: #f3f3f3;
  }

  & + .row {
    border-top: 1px solid #ccc;
  }

  cursor: pointer;
}

.cell {
  position: relative;
  padding: 0.5rem;  
  border-right: 1px solid #ccc;
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.header-cell {
  position: relative;
  background: #f0f0f0;
  font-weight: bold;
  user-select: none;
}

.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.draggrable {
  cursor: grab;
}
</style>
