import { ref, computed, watch } from 'vue'

export const formatDate = (date) => {
  // Get local date components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getEmptyMealStructure = () => ({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: []
})

// Initialize store with data from localStorage
const loadStoredMeals = () => {
  const stored = localStorage.getItem('dailyMeals')
  if (!stored) return {}
  return JSON.parse(stored)
}

const mealsStore = ref(loadStoredMeals())
const currentDate = ref(formatDate(new Date()))

// Watch for changes and update localStorage
watch(mealsStore, (newMeals) => {
  localStorage.setItem('dailyMeals', JSON.stringify(newMeals))
}, { deep: true })

export const useDailyMeals = () => {
  const getCurrentDayMeals = computed(() => {
    return mealsStore.value[currentDate.value] || getEmptyMealStructure()
  })

  const ensureDateExists = () => {
    if (!mealsStore.value[currentDate.value]) {
      mealsStore.value[currentDate.value] = getEmptyMealStructure()
    }
  }

  const addToMeal = (category, items) => {
    ensureDateExists()
    if (!mealsStore.value[currentDate.value][category]) return
    mealsStore.value[currentDate.value][category] = [
      ...mealsStore.value[currentDate.value][category],
      ...items
    ]
  }

  const removeFromMeal = (category, index) => {
    if (!mealsStore.value[currentDate.value]?.[category]) return
    mealsStore.value[currentDate.value][category].splice(index, 1)
  }

  const clearMeals = (category = null) => {
    ensureDateExists()
    if (category) {
      mealsStore.value[currentDate.value][category] = []
    } else {
      mealsStore.value[currentDate.value] = getEmptyMealStructure()
    }
  }

  const changeDate = (direction) => {
    const date = new Date(currentDate.value + 'T12:00:00')
    date.setDate(date.getDate() + direction)
    currentDate.value = formatDate(date)
  }

  const goToNextDay = () => changeDate(1)
  const goToPreviousDay = () => changeDate(-1)
  const goToToday = () => {
    currentDate.value = formatDate(new Date())
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

    const meals = getCurrentDayMeals.value
    const mealTotals = {}
    for (const [category, items] of Object.entries(meals)) {
      mealTotals[category] = calculateTotals(items)
    }

    const dailyTotal = Object.values(meals).flat().reduce((acc, item) => ({
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
    currentDate,
    meals: getCurrentDayMeals,
    addToMeal,
    removeFromMeal,
    clearMeals,
    totals,
    goToNextDay,
    goToPreviousDay,
    goToToday
  }
} 