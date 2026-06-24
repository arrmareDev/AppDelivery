<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.isAuth) {
    await auth.fetchMe()
  }
})
</script>

<style>
.app {
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>