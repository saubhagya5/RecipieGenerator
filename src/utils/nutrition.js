// Very rough nutrition lookup per ingredient (per unit). Real apps would use an API.
const NUTRITION_DB = {
  egg: { calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  tomato: { calories: 22, protein: 1, carbs: 5, fat: 0.2 },
  banana: { calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  'olive oil': { calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  mozzarella: { calories: 85, protein: 6.3, carbs: 0.7, fat: 6.3 },
  basil: { calories: 1, protein: 0.2, carbs: 0.1, fat: 0 },
  flour: { calories: 455, protein: 13, carbs: 95, fat: 1.2 },
  milk: { calories: 103, protein: 8, carbs: 12, fat: 2.4 },
  onion: { calories: 44, protein: 1.2, carbs: 10, fat: 0.1 },
  salt: { calories: 0, protein: 0, carbs: 0, fat: 0 },
}

export function estimateNutrition(ingredients) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  for (const ing of ingredients || []) {
    const name = typeof ing === 'string' ? ing.toLowerCase() : String(ing.name || '').toLowerCase()
    const qty = typeof ing === 'object' && ing.qty ? ing.qty : 1
    const base = NUTRITION_DB[name]
    if (!base) continue
    total.calories += base.calories * qty
    total.protein += base.protein * qty
    total.carbs += base.carbs * qty
    total.fat += base.fat * qty
  }
  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fat: Math.round(total.fat),
  }
}


