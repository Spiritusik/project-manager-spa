<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  onClose?: () => void;
}>()

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 400px;
}
</style>
