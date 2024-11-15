import { ref, watch } from 'vue'

export const useMealManager = () => {
  const meals = ref(() => {
    const stored = localStorage.getItem('dailyMeals')
    return stored ? JSON.parse(stored) : {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    }
  })

  // Persist meals to localStorage
  watch(meals, (newMeals) => {
    localStorage.setItem('dailyMeals', JSON.stringify(newMeals.value))
  }, { deep: true })

  const addToMeal = (category, items) => {
    if (!meals.value[category]) return
    meals.value[category] = [...meals.value[category], ...items]
  }

  const removeFromMeal = (category, index) => {
    if (!meals.value[category]) return
    meals.value[category] = meals.value[category].filter((_, i) => i !== index)
  }

  const clearMeals = (category = null) => {
    if (category) {
      meals.value[category] = []
    } else {
      meals.value = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    }
  }

  const calculateMealTotals = (items) => {
    return items.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (parseInt(item.macros.protein) || 0),
      carbs: acc.carbs + (parseInt(item.macros.carbs) || 0),
      fat: acc.fat + (parseInt(item.macros.fat) || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const getDailyTotals = () => {
    const allItems = Object.values(meals.value).flat()
    return calculateMealTotals(allItems)
  }

  const getMealTotals = (category) => {
    return calculateMealTotals(meals.value[category] || [])
  }

  return {
    meals,
    addToMeal,
    removeFromMeal,
    clearMeals,
    getDailyTotals,
    getMealTotals
  }
} 