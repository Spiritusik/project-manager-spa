
<script setup lang="ts">
  defineProps<{
    color?: string;
    size?: string;
  }>()
</script>

<template>
  <span 
    class="loader" 
    :style="{ 
      color: color,
      width: size || '48px', 
      height: size || '48px', 
      border: `5px solid ${ color || '#000000' }`,
      borderBottomColor: 'transparent',
    }"
  ></span>
</template>


<style scoped lang="scss">
.loader {
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
</style>