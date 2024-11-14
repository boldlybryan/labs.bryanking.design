export function getExperiments() {
  const experiments = import.meta.glob('/src/views/experiments/experiments/**/*.vue', { eager: true })
  
  return Object.entries(experiments).map(([path, module]) => {
    const id = path.match(/experiments\/(\d+)\/\d+\.vue$/)?.[1] || ''
    return {
      id,
      title: `Experiment ${id}`,
      path: `/experiments/${id}`
    }
  })
} 