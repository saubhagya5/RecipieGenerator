import { Link } from 'react-router-dom'
import { getFavorites, toggleFavorite, getRatings, setRating } from '../utils/storage.js'

export default function RecipeCard({ recipe, onFavoriteChange }) {
  const favs = getFavorites()
  const ratings = getRatings()
  const isFav = favs.has(recipe.id)
  const rating = ratings[recipe.id] || 0

  function handleFav() {
    const updated = toggleFavorite(recipe.id)
    if (onFavoriteChange) onFavoriteChange(new Set(updated))
  }

  function handleRate(value) {
    setRating(recipe.id, value)
  }

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden flex flex-col">
      <img
        src={recipe.image || '/vite.svg'}
        alt={recipe.name}
        className="h-40 w-full object-cover bg-gray-100"
        onError={(e) => { e.currentTarget.src = '/vite.svg' }}
      />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold">{recipe.name}</div>
          <button onClick={handleFav} aria-label="Favorite" className={"text-xl " + (isFav ? 'text-yellow-500' : 'text-gray-300 hover:text-gray-400')}>{isFav ? '★' : '☆'}</button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.cuisine || '—'}</span>
          <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.time}m</span>
          <span className="inline-flex items-center gap-1 bg-gray-100 border rounded-full px-2 py-0.5">{recipe.difficulty}</span>
          {(recipe.diet || []).map((d) => (
            <span key={d} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{d}</span>
          ))}
        </div>
        <div className="text-sm text-gray-700">
          Calories: {recipe.nutrition?.calories ?? '—'} | Protein: {recipe.nutrition?.protein ?? '—'}g
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="space-x-1">
            {[1,2,3,4,5].map((v) => (
              <button key={v} onClick={() => handleRate(v)} aria-label={`Rate ${v}`} className="text-sm">
                {v <= rating ? '●' : '○'}
              </button>
            ))}
          </div>
          <Link to={`/recipe/${recipe.id}`} className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">View</Link>
        </div>
      </div>
    </div>
  )
}


