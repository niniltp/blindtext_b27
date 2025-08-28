<script setup lang="ts">
import BlindText from '../components/BlindText.vue'
</script>

<template>
  <main class="game">
    <BlindText msg="BlindText" />
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .game {
    /* min-height: 100vh; */
    /* display: flex; */
    /* align-items: center; */
    /* margin: 10em 0; */
  }
}
</style>
