<script setup>
</script>

<template>
  <div>
    <nav style="display: flex; gap: 1rem;">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
      <router-link to="/experiments">Experiments</router-link>
    </nav>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<style lang="scss" scoped>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      color: #666;
    }
  }
}
main {
  padding: 1rem;
}
</style>
