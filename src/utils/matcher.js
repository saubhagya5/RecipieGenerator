export function normalizeIngredientName(ing) {
  if (!ing) return ''
  if (typeof ing === 'string') return ing.toLowerCase()
  if (typeof ing === 'object' && ing.name) return String(ing.name).toLowerCase()
  return String(ing).toLowerCase()
}

export function matchRecipes(availableIngredients, recipes, opts = {}) {
  const { diet = null, maxTime = null, difficulty = null } = opts
  const available = new Set((availableIngredients || []).map(normalizeIngredientName))

  return (recipes || [])
    .map((recipe) => {
      const ingreds = (recipe.ingredients || []).map(normalizeIngredientName)
      const overlap = ingreds.filter((i) => available.has(i)).length
      const baseScore = ingreds.length ? overlap / ingreds.length : 0
      const dietPenalty = diet && !(recipe.diet || []).includes(diet) ? -0.3 : 0
      const timePenalty = maxTime && recipe.time > maxTime ? -0.2 : 0
      const difficultyPenalty = difficulty && recipe.difficulty !== difficulty ? -0.1 : 0
      const score = baseScore + dietPenalty + timePenalty + difficultyPenalty
      const missingCount = Math.max(0, ingreds.length - overlap)
      return { ...recipe, score, overlap, missingCount }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function suggestSubstitutions(availableIngredients, recipe, substitutionsMap) {
  const available = new Set((availableIngredients || []).map(normalizeIngredientName))
  const ingreds = (recipe.ingredients || []).map(normalizeIngredientName)
  const suggestions = []
  for (const missing of ingreds) {
    if (available.has(missing)) continue
    const subs = substitutionsMap[missing]
    if (subs && subs.length) {
      suggestions.push({ missing, substitutes: subs })
    }
  }
  return suggestions
}


