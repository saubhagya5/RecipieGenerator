import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import substitutions from '../data/substitutions.json'
import { suggestSubstitutions } from '../utils/matcher.js'

export default function RecipeDetails() {
  const { id } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(1)
  const [available, setAvailable] = useState([])
  const [loading, setLoading] = useState(true)

  // Load recipe from localStorage or show not found
  useMemo(() => {
    const savedRecipes = localStorage.getItem('srg_generated_recipes')
    if (savedRecipes) {
      try {
        const recipes = JSON.parse(savedRecipes)
        const foundRecipe = recipes.find(r => r.id === id)
        if (foundRecipe) {
          setRecipe(foundRecipe)
          setServings(foundRecipe.servings || 1)
        }
      } catch (e) {
        console.error('Error loading recipe:', e)
      }
    }
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-gray-600">Loading recipe...</div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Recipe not found.</div>
          <Link to="/" className="text-blue-600">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const servingRatio = servings && recipe.servings ? servings / recipe.servings : 1
  const scaledNutrition = recipe.nutrition
    ? {
        calories: Math.round((recipe.nutrition.calories || 0) * servingRatio),
        protein: Math.round((recipe.nutrition.protein || 0) * servingRatio),
        carbs: Math.round((recipe.nutrition.carbs || 0) * servingRatio),
        fat: Math.round((recipe.nutrition.fat || 0) * servingRatio),
      }
    : null

  return (
    <div className="min-h-dvh">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="text-blue-600">← Back</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-2xl shadow border overflow-hidden">
          {recipe.image && (
            <img src={recipe.image} alt={recipe.name} className="w-full h-56 object-cover" />
          )}
          <div className="p-6 space-y-3">
            <h1 className="text-2xl font-semibold">{recipe.name}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-700">
              <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.cuisine}</span>
              <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.time}m</span>
              <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.difficulty}</span>
              {(recipe.diet || []).map((d) => (
                <span key={d} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{d}</span>
              ))}
            </div>
            <div className="pt-2">
              <label className="text-sm text-gray-700">
                Servings
                <input className="ml-2 w-20 rounded-lg border px-3 py-1" type="number" min="1" value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)} />
              </label>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-lg font-medium mb-3">Ingredients</h2>
            <ul className="list-disc pl-6 space-y-1">
              {(recipe.ingredients || []).map((i, idx) => (
                <li key={idx}>{typeof i === 'string' ? i : `${i.qty ? Math.round(i.qty * servingRatio * 100) / 100 : ''} ${i.unit || ''} ${i.name}`}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow border p-6">
            <h2 className="text-lg font-medium mb-3">Nutrition {scaledNutrition ? `(per ${servings} serving${servings>1?'s':''})` : ''}</h2>
            {scaledNutrition ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 border rounded-lg p-3">Calories: {scaledNutrition.calories}</div>
                <div className="bg-gray-50 border rounded-lg p-3">Protein: {scaledNutrition.protein} g</div>
                <div className="bg-gray-50 border rounded-lg p-3">Carbs: {scaledNutrition.carbs} g</div>
                <div className="bg-gray-50 border rounded-lg p-3">Fat: {scaledNutrition.fat} g</div>
              </div>
            ) : (
              <div>—</div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Steps</h2>
          <ol className="space-y-4 text-lg leading-8">
            {(recipe.steps || []).map((s, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">{idx+1}</span>
                <div className="flex-1">{s}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-white rounded-2xl shadow border p-6">
          <h2 className="text-lg font-medium mb-3">Substitutions</h2>
          <div className="mb-3">
            <input className="w-full md:w-1/2 rounded-lg border px-3 py-2" placeholder="Mark available (comma-separated)" onBlur={(e) => setAvailable(e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
          </div>
          {(() => {
            const subs = suggestSubstitutions(available, recipe, substitutions)
            if (!subs.length) return <div className="text-gray-600">—</div>
            return (
              <ul className="space-y-1">
                {subs.map((s) => (
                  <li key={s.missing}><strong>{s.missing}:</strong> {s.substitutes.join(', ')}</li>
                ))}
              </ul>
            )
          })()}
        </section>
      </main>
    </div>
  )
}


