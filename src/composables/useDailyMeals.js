import { ref, computed } from 'vue'

// Create a singleton store for meals
const mealsStore = ref({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: []
})

export const useDailyMeals = () => {
  const addToMeal = (category, items) => {
    if (!mealsStore.value[category]) return
    mealsStore.value[category] = [...mealsStore.value[category], ...items]
  }

  const removeFromMeal = (category, index) => {
    if (!mealsStore.value[category]) return
    mealsStore.value[category].splice(index, 1)
  }

  const clearMeals = (category = null) => {
    if (category) {
      mealsStore.value[category] = []
    } else {
      mealsStore.value = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    }
  }

  const totals = computed(() => {
    const calculateTotals = (items) => {
      return items.reduce((acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (parseInt(item.macros.protein) || 0),
        carbs: acc.carbs + (parseInt(item.macros.carbs) || 0),
        fat: acc.fat + (parseInt(item.macros.fat) || 0)
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }

    const mealTotals = {}
    for (const [category, items] of Object.entries(mealsStore.value)) {
      mealTotals[category] = calculateTotals(items)
    }

    const dailyTotal = Object.values(mealsStore.value).flat().reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (parseInt(item.macros.protein) || 0),
      carbs: acc.carbs + (parseInt(item.macros.carbs) || 0),
      fat: acc.fat + (parseInt(item.macros.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return {
      byMeal: mealTotals,
      daily: dailyTotal
    }
  })

  return {
    meals: mealsStore,
    addToMeal,
    removeFromMeal,
    clearMeals,
    totals
  }
} 