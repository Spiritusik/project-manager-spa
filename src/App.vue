<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import '@/assets/scss/main.scss'
import Header from './components/Header.vue';
</script>

<template>
  <Header/>

  <RouterView />  
</template>

<style scoped>
</style>
