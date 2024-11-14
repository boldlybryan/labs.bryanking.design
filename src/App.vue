<script setup lang="ts">
</script>

<template>
  <div>
    <nav style="display: flex; gap: 1rem;">
      <router-link to="/">Home</router-link>
    </nav>

    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
nav {
  display: flex;
  gap: 1rem;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      color: #666;
    }
    
  }
}
</style>
