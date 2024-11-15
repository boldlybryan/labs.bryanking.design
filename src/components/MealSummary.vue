<template>
  <div class="meal-summary">
    <div class="date-navigation">
      <button @click="goToPreviousDay">&larr;</button>
      <div class="current-date">
        <span>{{ formatDisplayDate(currentDate) }}</span>
        <button class="today-btn" @click="goToToday" v-if="isToday(currentDate)">
          Today
        </button>
      </div>
      <button @click="goToNextDay">&rarr;</button>
    </div>

    <div class="daily-total">
      <h3>Daily Totals</h3>
      <div class="macro-details">
        <p>Calories: {{ totals.daily.calories }}</p>
        <div class="macros">
          <span>P: {{ totals.daily.protein }}g</span>
          <span>C: {{ totals.daily.carbs }}g</span>
          <span>F: {{ totals.daily.fat }}g</span>
        </div>
      </div>
    </div>

    <div v-for="(items, category) in meals" :key="category" class="meal-category">
      <div class="category-header">
        <h3>{{ formatCategory(category) }}</h3>
        <button @click="clearMeals(category)" class="clear-btn" v-if="items.length">
          Clear
        </button>
      </div>

      <div v-if="items.length" class="meal-items">
        <div v-for="(item, index) in items" :key="index" class="meal-item">
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-portion">{{ item.assumedPortion }}</span>
          </div>
          <div class="item-macros">
            <span>{{ item.calories }} cal</span>
          </div>
          <button @click="removeFromMeal(category, index)" class="remove-btn">×</button>
        </div>

        <div class="category-total">
          <div class="macro-details">
            <p>Total: {{ totals.byMeal[category].calories }} cal</p>
            <div class="macros">
              <span>P: {{ totals.byMeal[category].protein }}g</span>
              <span>C: {{ totals.byMeal[category].carbs }}g</span>
              <span>F: {{ totals.byMeal[category].fat }}g</span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="empty-message">No items added</p>
    </div>
  </div>
</template>

<script setup>
import { useDailyMeals, formatDate } from '@/composables/useDailyMeals'

const { 
  meals, 
  removeFromMeal, 
  clearMeals, 
  totals, 
  currentDate,
  goToNextDay,
  goToPreviousDay,
  goToToday
} = useDailyMeals()

const formatCategory = (category) => {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  }).format(date)
}

const isToday = (dateStr) => {
  const today = formatDate(new Date())
  return today === dateStr
}
</script>

<style scoped>
.meal-summary {
  width: 300px;
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #ddd;
  height: 100vh;
  overflow-y: auto;
}

.date-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.current-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.today-btn {
  padding: 2px 8px;
  font-size: 0.8em;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.daily-total {
  background: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 2px solid #007bff;
}

.meal-category {
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  margin-bottom: 4px;
}

.item-info {
  flex: 1;
}

.item-macros {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 0.9em;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 8px;
}

.clear-btn {
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.empty-message {
  color: #666;
  font-style: italic;
}
</style> 