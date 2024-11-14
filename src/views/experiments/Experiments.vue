<template>
  <div>
    <h1>Experiments</h1>
    <ul>
      <li v-for="experiment in experiments" :key="experiment.id">
        <router-link :to="`/experiments/${experiment.id}`">{{ experiment.title }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { getExperiments } from '@/utils/experimentUtils'
const experiments = getExperiments()
</script>