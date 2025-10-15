import { useMemo, useState } from 'react'
import './App.css'
import ImageIngredientInput from './components/ImageIngredientInput.jsx'
import IngredientList from './components/IngredientList.jsx'
import { matchRecipes } from './utils/matcher.js'
import recipesData from './data/recipes.json'

function App() {
  const [ingredients, setIngredients] = useState([])
  const [manualInput, setManualInput] = useState('')
  const [diet, setDiet] = useState('')
  const [maxTime, setMaxTime] = useState('')

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

  const matches = useMemo(() => {
    const opts = {
      diet: diet || null,
      maxTime: maxTime ? Number(maxTime) : null,
    }
    return matchRecipes(ingredients, recipesData, opts)
  }, [ingredients, diet, maxTime])

  return (
    <div>
      <h1>Smart Recipe Generator</h1>

      <section>
        <h2>Add ingredients</h2>
        <ImageIngredientInput onAdd={handleAdd} />
        <div>
          <input
            placeholder="e.g. tomato, egg, basil"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
          />
          <button
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
        <IngredientList ingredients={ingredients} onRemove={handleRemove} />
      </section>

      <section>
        <h2>Filters</h2>
        <label>
          Diet:
          <select value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="">Any</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-free</option>
          </select>
        </label>
        <label>
          Max time (min):
          <input
            type="number"
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            min="0"
            inputMode="numeric"
          />
        </label>
      </section>

      <section>
        <h2>Matches</h2>
        {matches.length === 0 ? (
          <div>No matches yet. Add more ingredients.</div>
        ) : (
          <ul>
            {matches.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> · score {r.score.toFixed(2)} · {r.time}m
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
