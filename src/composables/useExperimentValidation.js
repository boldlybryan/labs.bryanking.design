import { ref } from 'vue'

// Automatically get all experiment modules
const experimentModules = import.meta.glob('/src/views/experiments/experiments/**/*.vue', { eager: true })

// Extract experiment IDs from the file paths
const validExperiments = ref(new Set(
  Object.keys(experimentModules)
    .map(path => path.match(/experiments\/(\d+)\/\d+\.vue$/)?.[1])
    .filter(Boolean)
))

export function useExperimentValidation() {
  const isValidExperiment = (id) => {
    return validExperiments.value.has(id)
  }

  return {
    isValidExperiment
  }
} 