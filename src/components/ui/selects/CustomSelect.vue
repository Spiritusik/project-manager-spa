<template>
  <div class="custom-select">
    <select v-model="localValue" @change="emitValue">
      <slot />
    </select>
    <span class="arrow"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string | number
}>()

const emit = defineEmits(['update:modelValue'])

const localValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const emitValue = (e: Event) => {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.custom-select {
  position: relative;
  display: inline-block;

  select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 100%;
    cursor: pointer;
    border: none;
    border-radius: 0;
    background-color: unset;
    color: inherit;
  }

  .arrow {
    position: absolute;
    right: 6px;
    top: 50%;
    width: 0.8em;
    height: 0.8em;
    transform: translateY(-50%);

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 50%;
      height: 50%;
      border: solid var(--icon-color, --primary-color);
      border-width: 0.1em 0.1em 0 0;

      transform: translate(-50%, -75%) rotate(135deg);
    }
  }
}
</style>
