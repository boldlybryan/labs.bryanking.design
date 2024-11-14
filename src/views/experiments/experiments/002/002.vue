<template>
  <div class="experiment">
    <h1>Experiment 002 - Meal Parser</h1>
    
    <div class="input-section">
      <h2>Describe Your Meal</h2>
      <textarea 
        v-model="mealDescription" 
        placeholder="Describe your meal (e.g., 'burger with 4oz 80/20 beef, brioche bun, mayo, lettuce')"
        :disabled="isLoading"
      ></textarea>
      <button @click="parseMeal" :disabled="isLoading || !mealDescription.trim()">
        {{ isLoading ? 'Parsing...' : 'Parse Meal' }}
      </button>
    </div>

    <div v-if="parsedMeal" class="result-section">
      <h2>Meal Summary</h2>
      
      <!-- Assumptions -->
      <div v-if="parsedMeal.assumptions?.length" class="assumptions-card">
        <h3>Assumptions Made</h3>
        <ul>
          <li v-for="(assumption, index) in parsedMeal.assumptions" 
              :key="index" 
              class="assumption">
            {{ assumption }}
          </li>
        </ul>
      </div>

      <!-- Total Nutrition -->
      <div class="total-card">
        <h3>Total Nutrition</h3>
        <div class="macro-details">
          <p class="total-calories">Total Calories: {{ totalCalories }}</p>
          <div class="macros">
            <span>Total Protein: {{ totalMacros.protein }}</span>
            <span>Total Carbs: {{ totalMacros.carbs }}</span>
            <span>Total Fat: {{ totalMacros.fat }}</span>
          </div>
        </div>
      </div>

      <!-- Ingredients Breakdown -->
      <h3>Ingredients Breakdown</h3>
      <div class="meal-details">
        <div v-for="(ingredient, index) in parsedMeal.ingredients" 
             :key="index" 
             class="ingredient-card">
          <div class="ingredient-header">
            <h3>{{ ingredient.name }}</h3>
            <span class="portion">{{ ingredient.assumedPortion }}</span>
          </div>
          <div class="macro-details">
            <p>Calories: {{ ingredient.calories }}</p>
            <div class="macros">
              <span>Protein: {{ ingredient.macros.protein }}</span>
              <span>Carbs: {{ ingredient.macros.carbs }}</span>
              <span>Fat: {{ ingredient.macros.fat }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div v-if="parsedMeal.disclaimer" class="disclaimer">
        {{ parsedMeal.disclaimer }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createChatCompletion } from '@/services/openai'

const mealDescription = ref('')
const parsedMeal = ref(null)
const isLoading = ref(false)

// Compute totals
const totalCalories = computed(() => {
  if (!parsedMeal.value) return 0
  return parsedMeal.value.ingredients.reduce((sum, ingredient) => sum + ingredient.calories, 0)
})

const totalMacros = computed(() => {
  if (!parsedMeal.value) return { protein: '0g', carbs: '0g', fat: '0g' }
  
  const totals = parsedMeal.value.ingredients.reduce((acc, ingredient) => {
    // Remove 'g' and convert to number, defaulting to 0 if parsing fails
    const protein = parseInt(ingredient.macros.protein) || 0
    const carbs = parseInt(ingredient.macros.carbs) || 0
    const fat = parseInt(ingredient.macros.fat) || 0
    
    return {
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat
    }
  }, { protein: 0, carbs: 0, fat: 0 })

  // Add 'g' suffix to the final totals
  return {
    protein: `${totals.protein}g`,
    carbs: `${totals.carbs}g`,
    fat: `${totals.fat}g`
  }
})

const systemPrompt = `You are a meal parsing assistant specializing in nutritional analysis. 
Your responses are estimates based on typical nutritional values.

When portions aren't specified:
- Use common serving sizes (e.g., 2oz dry pasta per person)
- Note assumptions made in the response
- Request clarification for ambiguous portions

Respond with valid JSON following this format:
{
  "assumptions": string[],  // e.g., ["Standard 2oz pasta portion assumed"]
  "ingredients": [
    {
      "name": "string",
      "assumedPortion": string,  // e.g., "2oz dry (56g)"
      "calories": number,
      "macros": {
        "protein": "string",
        "carbs": "string",
        "fat": "string"
      }
    }
  ],
  "disclaimer": "Nutritional values are estimates and may vary based on specific ingredients and preparation methods."
}`

const parseMeal = async () => {
  if (!mealDescription.value.trim() || isLoading.value) return
  
  isLoading.value = true
  try {
    const response = await createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: mealDescription.value }
      ],
      temperature: 0.3  // Lower temperature for more consistent results
    })
    
    const parsed = JSON.parse(response.content)
    
    if (parsed.needsMoreInfo) {
      // Could either show these as warnings or implement a multi-step input process
      parsedMeal.value = {
        ingredients: parsed.ingredients,
        warnings: parsed.missingInfo
      }
    } else {
      parsedMeal.value = parsed
    }
  } catch (error) {
    console.error('Failed to parse meal:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.experiment {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin-bottom: 2rem;
}

textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-section {
  margin-top: 2rem;
}

.total-card {
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.total-calories {
  font-size: 1.2em;
  font-weight: bold;
  color: #007bff;
}

.ingredient-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.macro-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.macros {
  display: flex;
  gap: 16px;
  color: #666;
}
</style>