import { useMemo, useState, useEffect } from 'react'
import ImageIngredientInput from '../components/ImageIngredientInput.jsx'
import IngredientList from '../components/IngredientList.jsx'
import RecipeCard from '../components/RecipeCard.jsx'
import { generateRecipes } from '../services/gemini.js'
import { preferenceVector } from '../utils/storage.js'
import { getFavorites } from '../utils/storage.js'

export default function Home() {
  const [ingredients, setIngredients] = useState([])
  const [manualInput, setManualInput] = useState('')
  const [diet, setDiet] = useState('')
  const [maxTime, setMaxTime] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [generatedRecipes, setGeneratedRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleAdd(newOnes) {
    const current = new Set(ingredients)
    for (const ing of Array.isArray(newOnes) ? newOnes : [newOnes]) {
      if (!ing) continue
      current.add(String(ing).toLowerCase())
    }
    setIngredients(Array.from(current))
  }

  function handleRemove(ing) {
    setIngredients((prev) => prev.filter((i) => i !== ing))
  }

  // Generate recipes when ingredients change
  useEffect(() => {
    if (ingredients.length === 0) {
      setGeneratedRecipes([])
      return
    }

    const generateRecipesWithDelay = async () => {
      setLoading(true)
      setError('')
      try {
        const options = {
          diet: diet || '',
          maxTime: maxTime || '',
          difficulty: difficulty || ''
        }
        const recipes = await generateRecipes(ingredients, options)
        setGeneratedRecipes(recipes)
        // Save to localStorage for RecipeDetails access
        localStorage.setItem('srg_generated_recipes', JSON.stringify(recipes))
      } catch (err) {
        setError(err.message)
        setGeneratedRecipes([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(generateRecipesWithDelay, 1000)
    return () => clearTimeout(timeoutId)
  }, [ingredients, diet, maxTime, difficulty])

  const [favoriteIds, setFavoriteIds] = useState(() => getFavorites())

  return (
    <div className="min-h-dvh">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Smart Recipe Generator</h1>
          <div className="text-sm text-gray-500">Cook from what you have</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-3">
        <section className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="text-lg font-medium mb-3">Add ingredients</h2>
            <div className="mb-3">
              <ImageIngredientInput onAdd={handleAdd} />
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                placeholder="e.g. tomato, egg, basil"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
              />
              <button
                className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                onClick={() => {
                  if (!manualInput.trim()) return
                  const split = manualInput
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                  handleAdd(split)
                  setManualInput('')
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="text-lg font-medium mb-3">Your ingredients</h2>
            <IngredientList ingredients={ingredients} onRemove={handleRemove} />
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="text-lg font-medium mb-3">Filters</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">Diet</span>
                <select className="w-full rounded-lg border px-3 py-2" value={diet} onChange={(e) => setDiet(e.target.value)}>
                  <option value="">Any</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-free</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-gray-600 mb-1">Difficulty</span>
                <select className="w-full rounded-lg border px-3 py-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">Any</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
              <label className="text-sm col-span-2">
                <span className="block text-gray-600 mb-1">Max time (min)</span>
                <input
                  className="w-full rounded-lg border px-3 py-2"
                  type="number"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                  min="0"
                  inputMode="numeric"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Favorites</h2>
            {favoriteIds.size === 0 ? (
              <div className="text-gray-600">No favorites yet.</div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {Array.from(favoriteIds)
                  .map(id => generatedRecipes.find(r => r.id === id))
                  .filter(Boolean)
                  .map((r) => (
                    <div key={r.id} className="min-w-[240px] max-w-[240px]">
                      <RecipeCard recipe={r} onFavoriteChange={setFavoriteIds} />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <h2 className="text-lg font-medium mb-3">Generated Recipes</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Generating recipes with AI...</div>
            </div>
          ) : error ? (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
              {error}
            </div>
          ) : generatedRecipes.length === 0 ? (
            <div className="text-gray-600">Add ingredients to generate recipes.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedRecipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} onFavoriteChange={setFavoriteIds} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}


