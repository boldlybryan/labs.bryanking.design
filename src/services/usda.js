import { USDA_CONFIG } from './config'

export const searchFoodItem = async (query) => {
  if (!USDA_CONFIG.apiKey) {
    console.error('USDA API key is not configured')
    return null
  }

  // Clean up the query and add modifiers for better matching
  const searchTerm = query.toLowerCase()
    .replace('with', '') // Remove 'with' to improve matching
    .trim()

  const params = new URLSearchParams({
    api_key: USDA_CONFIG.apiKey,
    query: searchTerm,
    dataType: ['Survey (FNDDS)'],
    pageSize: 25  // Increase page size to get more potential matches
  })

  try {
    const response = await fetch(`${USDA_CONFIG.baseURL}/foods/search?${params}`)
    if (!response.ok) {
      throw new Error(`USDA API request failed: ${response.statusText}`)
    }
    const data = await response.json()
    
    // Try to find the best match from results
    if (data?.foods?.length) {
      // Sort results to prioritize exact matches and raw ingredients
      data.foods.sort((a, b) => {
        const aDesc = a.description.toLowerCase()
        const bDesc = b.description.toLowerCase()
        const queryTerms = searchTerm.split(' ')
        
        // Prefer exact matches
        const aExactMatch = queryTerms.every(term => aDesc.includes(term))
        const bExactMatch = queryTerms.every(term => bDesc.includes(term))
        
        if (aExactMatch && !bExactMatch) return -1
        if (!aExactMatch && bExactMatch) return 1
        
        return 0
      })
    }
    
    return data
  } catch (error) {
    console.error('USDA API Error:', error)
    return null
  }
}

export const getFoodDetails = async (fdcId) => {
  if (!USDA_CONFIG.apiKey) {
    console.error('USDA API key is not configured')
    return null
  }

  const params = new URLSearchParams({
    api_key: USDA_CONFIG.apiKey
  })

  try {
    const response = await fetch(`${USDA_CONFIG.baseURL}/food/${fdcId}?${params}`)
    if (!response.ok) {
      throw new Error(`USDA API request failed: ${response.statusText}`)
    }
    const data = await response.json()
    console.log('USDA Food Details Response:', data)
    return data
  } catch (error) {
    console.error('USDA API Error:', error)
    return null
  }
}

export const enhanceNutritionalData = async (ingredient) => {
  try {
    console.log('\n--- Starting enhancement for:', ingredient.name, '---')
    const searchResults = await searchFoodItem(ingredient.name)
    
    if (!searchResults?.foods?.length) return ingredient

    const usdaFood = searchResults.foods[0]
    console.log('Matched USDA food:', usdaFood.description)
    
    const details = await getFoodDetails(usdaFood.fdcId)
    
    // Initialize nutrients with zeros
    const nutrients = {
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }

    // Map USDA nutrients to our format
    if (details?.foodNutrients) {
      details.foodNutrients.forEach(nutrient => {
        const nutrientNumber = nutrient.nutrient?.number
        const amount = nutrient.amount || 0

        switch(nutrientNumber) {
          case '208': // Energy (kcal)
            nutrients.calories = amount
            console.log(`${ingredient.name} - Found calories:`, amount)
            break
          case '203': // Protein
            nutrients.macros.protein = amount
            console.log(`${ingredient.name} - Found protein:`, amount)
            break
          case '205': // Carbohydrates
            nutrients.macros.carbs = amount
            console.log(`${ingredient.name} - Found carbs:`, amount)
            break
          case '204': // Total Fat
            nutrients.macros.fat = amount
            console.log(`${ingredient.name} - Found fat:`, amount)
            break
        }
      })
    }

    const portionMultiplier = getPortionMultiplier(ingredient.assumedPortion, usdaFood)
    console.log(`${ingredient.name} - Portion multiplier:`, portionMultiplier)

    const enhancedIngredient = {
      ...ingredient,
      calories: Math.round(nutrients.calories * portionMultiplier),
      macros: {
        protein: (nutrients.macros.protein * portionMultiplier).toFixed(1),
        carbs: (nutrients.macros.carbs * portionMultiplier).toFixed(1),
        fat: (nutrients.macros.fat * portionMultiplier).toFixed(1)
      },
      source: 'USDA',
      usdaFoodId: usdaFood.fdcId,
      matchedDescription: usdaFood.description
    }

    console.log(`${ingredient.name} - Final enhanced values:`, {
      calories: enhancedIngredient.calories,
      macros: enhancedIngredient.macros
    })
    console.log('--- End enhancement ---\n')
    
    return enhancedIngredient
  } catch (error) {
    console.warn('Failed to enhance with USDA data:', error)
    return ingredient
  }
}

const getPortionMultiplier = (assumedPortion, usdaFood) => {
  // Extract amount and unit from assumed portion
  const match = assumedPortion.match(/^([\d/.]+)\s*([a-zA-Z]+)/)
  if (!match) return 1

  const [_, amount, unit] = match
  const portionAmount = eval(amount) // Safely evaluate fractions like "1/4"

  // Convert common measurements to grams
  const conversions = {
    cup: 240,
    cups: 240,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    oz: 28.35,
    ounce: 28.35,
    ounces: 28.35,
    g: 1,
    gram: 1,
    grams: 1
  }

  if (!conversions[unit.toLowerCase()]) return 1

  const gramsPerServing = conversions[unit.toLowerCase()] * portionAmount
  const standardServingGrams = 100 // USDA data is typically per 100g

  return gramsPerServing / standardServingGrams
} 