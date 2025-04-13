<script setup lang="ts">
import { defineProps, ref, computed, watch, onMounted } from 'vue';
import draggable from 'vuedraggable';
import ArrowUp from '../ui/icons/ArrowUp.vue';
import { loadFromStorage, saveToStorage } from '@/utils/localStorage';

type SortOrder = 'asc' | 'desc';

interface Column {
  label: string;
  key: string;
  width?: number;
  sortable?: boolean;
}

type SortKey = typeof props.columns[number]['key'];

const sortIconWidth: number = 24;

const props = defineProps<{
  columns: Column[];
  data: Record<string, any>[];
  draggable?: boolean;
  group?: string;
  storageKey?: string;
}>();

const sortKeys = new Set();
const columns = ref(props.columns.map(col => {
  sortKeys.add(col.key);
  return { 
    width: col.width || 75, 
    ...col 
  }
}));
const data = ref(props.data.slice());
const isDraggable = props.draggable ?? false;
const groupName = props.group ?? 'default-table-group';
const sortOrder = ref<SortOrder>('asc');
const sortKey = ref<SortKey>(props.columns[0]['key']);
const isResizing = ref(false);

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

const toggleSort = (e: MouseEvent, key: SortKey) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('table__resizer') || isResizing.value) return;

  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }

  sortData();
};

const startResize = (e: MouseEvent, colIndex: number) => {
  isResizing.value = true;

  const startX = e.pageX;
  const startWidth = columns.value[colIndex].width;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.pageX - startX;
    columns.value[colIndex].width = Math.max(50, startWidth + delta);
  };

  const onMouseUp = () => {
    setTimeout(() => isResizing.value = false);
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
  if (evt.moved) {
    sortKey.value = '' as SortKey;
  }
};

const onClick = (e: MouseEvent, item: any) => {
  const target = e.target as HTMLElement;
  if (['table__resizer', 'table__cell--drag-handle'].some(cls => target.classList.contains(cls)) || isResizing.value) return;

  emit('click:item', {
    item,
  });
};

watch([sortKey, sortOrder], () => {
  if (!props.storageKey) return;
  
  saveToStorage(`${props.storageKey}:sort`, {
    sortKey: sortKey.value,
    sortOrder: sortOrder.value,
  });
});

watch(columns, () => {
  if (!props.storageKey) return;
  const widths = columns.value.map(col => col.width);
  saveToStorage(`${props.storageKey}:colWidths`, widths);
}, { deep: true });

onMounted(() => {
  if (!props.storageKey) return;

  const sort = loadFromStorage<{
    sortKey: SortKey;
    sortOrder: SortOrder;
  }>(`${props.storageKey}:sort`);

  if(sort && sortKeys.has(sort.sortKey)) {
    sortKey.value = sort.sortKey;
    sortOrder.value = sort.sortOrder;
    sortData();
  }

  const widths = loadFromStorage<number[]>(`${props.storageKey}:colWidths`);
  if (widths && widths.length === columns.value.length) {
    columns.value = columns.value.map((col, i) => ({
      ...col,
      width: widths[i],
    }));
  }
})
</script>

<template>
  <div class="table">
    <div 
      class="table__row table__row--header"
    >
      <div
        v-if="isDraggable"
        class="table__cell table__cell--header table__cell--drag-handle"
      >
        ⠿
      </div>
      <template v-for="(col, index) in columns" :key="col.key">
        <div
          class="table__cell table__cell--header"
          @click="toggleSort($event, col.key)"
          :style="{ width: col.width + 'px' }"
        >
          <span class="table__text">{{ col.label }}</span>
          <span
            class="table__sort-icon"
            :class="col.key === sortKey ? sortOrder : ''"
          >
            <ArrowUp />
          </span>
          <div
            class="table__resizer"
            @mousedown="startResize($event, index)"
          ></div>
        </div>
      </template>
    </div>

    <draggable
      v-if="isDraggable"
      handle=".table__cell--drag-handle"
      item-key="id"
      :group="{ name: groupName, pull: true, put: true }"
      v-model="data"
      @change="onChange"
    >
      <template #item="{ element }">
        <div @click="onClick($event, element)" class="table__row">
          <div class="table__cell table__cell--drag-handle">⠿</div>
          <div
            class="table__cell"
            v-for="(col, colIndex) in columns"
            :key="col.key"
            :style="{ width: col.width + 'px' }"
          >
            <span class="table__text">{{ element[col.key] }}</span>
            <div
              class="table__resizer"
              @mousedown="startResize($event, colIndex)"
            ></div>
          </div>
        </div>
      </template>
      <template #footer v-if="!data.length">
        <div 
          class="table__drop-placeholder" 
          :style="{
            width: `${columns.reduce((accumulator, currentValue) => accumulator + currentValue.width, sortIconWidth)}px`,
          }">
          Drag items here to add them to this group, or create a new item with this group.
        </div>
      </template>
    </draggable>

    <template v-else>
      <div
        class="table__row"
        v-for="(item, rowIndex) in data"
        :key="rowIndex"
        @click="onClick($event, item)"
      >
        <div
          class="table__cell"
          v-for="(col, index) in columns"
          :key="col.key"
          :style="{ width: col.width + 'px' }"
        >
          <span class="table__text">{{ item[col.key] }}</span>
          <div
            class="table__resizer"
            @mousedown="startResize($event, index)"
          ></div>
        </div>
      </div>
      <div 
        v-if="!data.length"
        class="table__drop-placeholder" 
        :style="{
          width: `${columns.reduce((accumulator, currentValue) => accumulator + currentValue.width, 0)}px`,
        }">
        No data
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.table {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;

  overflow: auto;
  border: 1px solid var(--table-border-color);
  width: fit-content;
  max-width: 100%;
  
  font-size: 14px;
  user-select: none;

  &__row {
    display: flex;
    cursor: pointer;
    background-color: var(--table-body-color);
    width: fit-content;

    &:hover {
      background-color: var(--table-body-hover-color);
    }

    &--header {
      background: var(--table-header-color);
      font-weight: bold;
      user-select: none;
      color: var(--header-color);

      &:hover {
        background: var(--table-header-color);
      }

      .table__cell--drag-handle {
        cursor: default;
      }
    }

    &:first-child {
      .table__cell {
        border-top-width: 0;
      }
    }

    &:last-child {
      .table__cell {
        border-bottom-width: 0;
      }
    }
  }

  &__cell {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    width: fit-content;
    border: solid black;
    border-width: 0 0 1px;
    padding: 5px 10px 5px 5px;
    box-sizing: border-box;

    &--header {
      &:hover .table__sort-icon {
        opacity: 0.6;
      }

      .table__sort-icon.asc,
      .table__sort-icon.desc {
        opacity: 1;
      }
    }

    &--drag-handle {
      cursor: grab;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      width: 24px;
      user-select: none;
    }

    &:last-child {
      .table__resizer {
        border-right-width: 0;
      }
    }
  }

  &__text {
    display: inline-block;
    flex-grow: 1;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__sort-icon {
    display: inline-block;
    flex-shrink: 0;
    justify-self: flex-end;
    opacity: 0;
    transition: all 0.3s linear;

    &.desc {
      transform: rotate(-180deg);
    }

    svg {
      height: 0.8em;

      fill: var(--secondary-color);
    }
  }

  &__resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 5px;
    height: 100%;
    border-right: 1px solid black;
    cursor: col-resize;
    z-index: 10;
  }
  
  &__drop-placeholder {
    display: none;
    padding: 5px;
    text-align: center;
    width: 100%;
    flex-shrink: 0;

    &:only-child {
      display: block;
    }

    & + .table__row {
      border-top: 1px solid var(--primary-color)
    }
  }
}
</style>
