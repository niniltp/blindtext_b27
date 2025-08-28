<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Button } from 'primevue'
import { ref } from 'vue'

const isDarkMode = ref<boolean>(false)

function toggleDarkMode() {
  document.documentElement.classList.toggle('darkmode')
  isDarkMode.value = !isDarkMode.value
}
</script>

<template>
  <Button
    :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
    @click="toggleDarkMode()"
    class="dark-button"
  />

  <div>
    <h1 class="text-primary">B27</h1>
    <RouterView />
  </div>
</template>

<style scoped>
.dark-button {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 999;
}

h1 {
  font-weight: 600;
  font-size: 2.4rem;
  position: relative;
  top: -10px;
  text-align: center;
  padding-bottom: 2rem;
}
</style>
