<template>
  <div class="experiment">
    <h1>Experiment 002 - Meal Parser</h1>
    
    <div class="input-section">
      <h2>Describe Your Meal</h2>
      <div class="input-container">
        <textarea 
          v-model="mealDescription" 
          placeholder="Describe your meal (e.g., 'burger with 4oz 80/20 beef, brioche bun, mayo, lettuce')"
          :disabled="isLoading || isListening"
        ></textarea>
        <button 
          class="mic-button" 
          @click="isListening ? stopListening() : startListening(handleSpeechInput)"
          :disabled="isLoading"
          :class="{ 'listening': isListening }"
        >
          <span class="mic-icon">🎤</span>
          {{ isListening ? 'Stop' : 'Speak' }}
        </button>
        <button @click="parseMeal" :disabled="isLoading || !mealDescription.trim() || isListening">
          {{ isLoading ? 'Parsing...' : 'Enter' }}
        </button>
      </div>
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
            <div class="portions">
              <span class="portion assumed">{{ ingredient.assumedPortion }}</span>
              <span v-if="servingSizes[index] !== 1" class="portion actual">
                ({{ formatActualPortion(ingredient.assumedPortion, servingSizes[index]) }})
              </span>
            </div>
          </div>
          <div class="serving-adjuster">
            <div class="serving-inputs">
              <div class="input-group">
                <label>Servings:</label>
                <input 
                  type="number" 
                  v-model.number="servingSizes[index]"
                  min="0.1"
                  max="10"
                  step="0.1"
                  class="number-input"
                />
              </div>
              <div class="input-group">
                <label>Or enter portion:</label>
                <input 
                  type="text" 
                  :value="formatActualPortion(ingredient.assumedPortion, servingSizes[index])"
                  @change="updatePortion($event, index, ingredient.assumedPortion)"
                  class="portion-input"
                  :placeholder="ingredient.assumedPortion"
                />
              </div>
            </div>
          </div>
          <div class="macro-details">
            <p>Calories: {{ Math.round(ingredient.calories * servingSizes[index]) }}</p>
            <div class="macros">
              <span>Protein: {{ Math.round(parseInt(ingredient.macros.protein) * servingSizes[index]) }}g</span>
              <span>Carbs: {{ Math.round(parseInt(ingredient.macros.carbs) * servingSizes[index]) }}g</span>
              <span>Fat: {{ Math.round(parseInt(ingredient.macros.fat) * servingSizes[index]) }}g</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div v-if="parsedMeal.disclaimer" class="disclaimer">
        {{ parsedMeal.disclaimer }}
      </div>

      <hr>

      <pre><code>{{ parsedMeal }}</code></pre>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createChatCompletion } from '@/services/openai'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

const mealDescription = ref('')
const parsedMeal = ref(null)
const isLoading = ref(false)
const servingSizes = ref({}) // Track multipliers for each ingredient

const { isListening, error: speechError, startListening, stopListening } = useSpeechRecognition()

const formatActualPortion = (assumedPortion, multiplier) => {
  // Extract number and unit from assumed portion (e.g., "2oz dry (56g)" -> [2, "oz"])
  const match = assumedPortion.match(/(\d+(\.\d+)?)\s*([a-zA-Z]+)/)
  if (!match) return `${multiplier}x`
  
  const [_, amount, __, unit] = match
  const actualAmount = (parseFloat(amount) * multiplier).toFixed(1)
  return `${actualAmount}${unit}`
}

// Initialize serving sizes when meal is parsed
const initializeServingSizes = (ingredients) => {
  servingSizes.value = ingredients.reduce((acc, ingredient, index) => {
    acc[index] = 1
    return acc
  }, {})
}

// Compute totals
const totalCalories = computed(() => {
  if (!parsedMeal.value) return 0
  return parsedMeal.value.ingredients.reduce((sum, ingredient, index) => 
    sum + (ingredient.calories * (servingSizes.value[index] || 1)), 0
  )
})

const totalMacros = computed(() => {
  if (!parsedMeal.value) return { protein: '0g', carbs: '0g', fat: '0g' }
  
  const totals = parsedMeal.value.ingredients.reduce((acc, ingredient, index) => {
    const multiplier = servingSizes.value[index] || 1
    const protein = (parseInt(ingredient.macros.protein) || 0) * multiplier
    const carbs = (parseInt(ingredient.macros.carbs) || 0) * multiplier
    const fat = (parseInt(ingredient.macros.fat) || 0) * multiplier
    
    return {
      protein: acc.protein + protein,
      carbs: acc.carbs + carbs,
      fat: acc.fat + fat
    }
  }, { protein: 0, carbs: 0, fat: 0 })

  return {
    protein: `${Math.round(totals.protein)}g`,
    carbs: `${Math.round(totals.carbs)}g`,
    fat: `${Math.round(totals.fat)}g`
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
      temperature: 0.3
    })
    
    const parsed = JSON.parse(response.content)
    parsedMeal.value = parsed
    initializeServingSizes(parsed.ingredients)
  } catch (error) {
    console.error('Failed to parse meal:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSpeechInput = (finalTranscript, interimTranscript) => {
  mealDescription.value = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')
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
  height: 40px;
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

.serving-adjuster {
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.serving-adjuster label {
  color: #666;
  font-size: 0.9em;
}

.serving-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: #ddd;
  border-radius: 2px;
  outline: none;
}

.serving-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.serving-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.portions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.portion {
  font-size: 0.9em;
  color: #666;
}

.portion.assumed {
  font-style: italic;
}

.portion.actual {
  color: #007bff;
  font-weight: 500;
}

.serving-inputs {
  display: flex;
  gap: 16px;
  align-items: center;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.number-input, .portion-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100px;
}

.input-group label {
  font-size: 0.9em;
  color: #666;
}

.input-container {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}

.mic-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #28a745;
}

.mic-button.listening {
  background: #dc3545;
  animation: pulse 1.5s infinite;
}

.mic-icon {
  font-size: 1.2em;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>