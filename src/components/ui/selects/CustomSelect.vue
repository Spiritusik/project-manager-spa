<template>
  <div class="custom-select" :class="classes">
    <select v-model="localValue">
      <slot />
    </select>
    <span class="custom-select__arrow"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string | number,
    variant?: 'primary' | 'secondary',
    rounded?: 'left' | 'right' | 'none' | 'full',
  }>(),
  {
    variant: 'primary',
    rounded: 'full',
  }
); 

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const classes = computed(() => [
  'custom-select',
  props.variant && `custom-select--${props.variant}`,
  props.rounded && `custom-select--rounded-${props.rounded}`,
])

</script>

<style scoped lang="scss">
.custom-select {
  --bg-color: var(--primary-color);
  --color: var(--secondary-color);
  --border-radius: var(--input-border-radius);
  --border-color: var(--primary-color);

  position: relative;
  display: inline-block;
  background-color: var(--bg-color);
  color: var(--color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);

  &--rounded {
    &-right {
      --border-radius: 0 var(--input-border-radius) var(--input-border-radius) 0;
    }

    &-left {
      --border-radius: var(--input-border-radius) 0 0 var(--input-border-radius);
    }

    &-full {
        --border-radius: var(--input-border-radius);
    }
  }

  &--secondary {
    --bg-color: var(--secondary-color);
    --color: var(--primary-color);
    --border-radius: var(--input-border-radius);
    --border-color: var(--primary-color);
  }

  select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;

    border: none;
    border-radius: 0;
    padding-right: 1.5em;
    width: 100%;
    background-color: unset;
    color: var(--color);
  }

  &__arrow {
    position: absolute;
    right: 6px;
    top: 50%;
    
    width: 0.8em;
    height: 0.8em;
    transform: translateY(-50%);
    pointer-events: none;

    &::before {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      width: 50%;
      height: 50%;
      border: solid var(--color);
      border-width: 0.1em 0.1em 0 0;

      transform: translate(-50%, -75%) rotate(135deg);
    }
  }
}
</style>
