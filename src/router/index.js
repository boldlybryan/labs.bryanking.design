import { createRouter, createWebHistory } from 'vue-router'
import { useExperimentValidation } from '../composables/useExperimentValidation'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/Home.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/about/About.vue')
    },
    {
      path: '/experiments',
      name: 'experiments',
      component: () => import('../views/experiments/Experiments.vue')
    },
    {
      path: '/experiments/:id',
      name: 'experiment',
      component: () => import('../views/experiments/_id.vue'),
      beforeEnter: (to) => {
        const { isValidExperiment } = useExperimentValidation()
        const id = to.params.id
        
        if (!isValidExperiment(id)) {
          return { name: '404' }
        }
      }
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/error/404.vue')
    }
  ]
})

export default router 