
1. **Intelligent Meal Planning**
```javascript
const agentPrompt = `You are a meal planning assistant. Based on the user's:
- Previous meal entries
- Nutritional targets
- Dietary preferences/restrictions
Suggest complementary meals to help them meet their daily goals.`
```

2. **Smart Portion Adjustment**
```javascript
const adjustPortions = async (meal, userGoals) => {
  // Agent optimizes portions to meet nutritional targets while maintaining taste
  const response = await createChatCompletion({
    messages: [
      { role: 'system', content: 'Adjust meal portions to meet nutritional goals' },
      { role: 'user', content: `Meal: ${meal}, Goals: ${userGoals}` }
    ]
  })
  return JSON.parse(response.content)
}

3. **Ingredient Substitution Agent**
```javascript
const suggestSubstitutions = async (ingredients, preferences) => {
  // Agent suggests healthier alternatives or substitutes for dietary restrictions
  // e.g., "80/20 beef" → "93/7 beef" or "impossible meat" for vegetarians
  // Returns alternatives with comparative nutritional impact
}
```

4. **Recipe Decomposition Agent**
```javascript
const decomposeRecipe = async (recipeName) => {
  // Agent breaks down complex dishes into constituent ingredients
  // e.g., "chicken parmesan" → chicken breast, breadcrumbs, marinara, cheese
  // Includes typical portions and cooking methods
}
```

5. **Natural Language Understanding Improvements**
```javascript
const enhancedParsing = async (description) => {
  // Agent handles complex meal descriptions
  // - Understands context ("like yesterday's lunch")
  // - Resolves ambiguous quantities ("handful", "splash")
  // - Identifies cooking methods that affect nutrition
}
```

6. **Personalized Feedback Agent**
```javascript
const provideFeedback = async (mealHistory, nutritionalGoals) => {
  // Agent analyzes eating patterns and provides actionable insights
  // - Identifies nutrient deficiencies
  // - Suggests balanced alternatives
  // - Offers meal timing recommendations
}
```

7. **Restaurant Menu Interpreter**
```javascript
const parseRestaurantMeal = async (menuItem, restaurant) => {
  // Agent estimates nutrition for restaurant meals
  // - Uses knowledge of common preparation methods
  // - Accounts for restaurant-specific portions
  // - Suggests modifications for healthier options
}
```

8. **Shopping List Generator**
```javascript
const generateShoppingList = async (plannedMeals) => {
  // Agent creates optimized shopping lists
  // - Combines common ingredients
  // - Suggests bulk purchases
  // - Estimates quantities needed
}
```

Implementation Strategy:
1. Create specialized agents for each use case
2. Implement as composables for reusability
3. Add to the existing UI progressively
4. Use streaming responses for real-time feedback
5. Cache common responses to reduce API usage

---

some other ideas:
- agent that helps people estimate serving sizes for commonly consumed foods
- agent for restaurants that helps them estimate the nutritional value of their food (WOULD BE HUGE for improving ease and accuracy of nutrition tracking. could be sold to restaurants individually, or packaged with their other tech like Toast, etc.)
