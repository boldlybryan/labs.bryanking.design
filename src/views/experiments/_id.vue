<template>
  <div>
    <router-link to="/experiments">Back to Experiments</router-link>
    <p>{{ id }}</p>
    <Suspense>
      <template #default>
        <component :is="experimentComponent" v-if="experimentComponent" />
      </template>
      <template #fallback>
        <p>Loading experiment...</p>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useExperimentValidation } from '@/composables/useExperimentValidation'

const route = useRoute()
const id = computed(() => route.params.id)
const { isValidExperiment } = useExperimentValidation()

const experimentComponent = shallowRef()

if (isValidExperiment(id.value)) {
  experimentComponent.value = defineAsyncComponent({
    loader: () => import(`./experiments/${id.value}/${id.value}.vue`),
    onError: (error) => {
      console.error(`Failed to load experiment ${id.value}:`, error)
    }
  })
}
</script> 