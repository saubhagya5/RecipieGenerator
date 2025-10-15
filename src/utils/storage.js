const RATINGS_KEY = 'srg_ratings'
const FAVS_KEY = 'srg_favorites'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function getRatings() {
  return read(RATINGS_KEY, {})
}

export function setRating(recipeId, rating) {
  const all = getRatings()
  all[recipeId] = rating
  write(RATINGS_KEY, all)
}

export function getFavorites() {
  return new Set(read(FAVS_KEY, []))
}

export function toggleFavorite(recipeId) {
  const current = getFavorites()
  if (current.has(recipeId)) current.delete(recipeId)
  else current.add(recipeId)
  write(FAVS_KEY, Array.from(current))
  return current
}

export function preferenceVector(recipes) {
  const ratings = getRatings()
  const pref = { cuisines: {}, diet: {}, avgDifficulty: 0, count: 0 }
  for (const r of recipes) {
    const rating = ratings[r.id]
    if (!rating) continue
    pref.count += 1
    pref.avgDifficulty += difficultyToScore(r.difficulty)
    if (r.cuisine) pref.cuisines[r.cuisine] = (pref.cuisines[r.cuisine] || 0) + rating
    for (const d of r.diet || []) {
      pref.diet[d] = (pref.diet[d] || 0) + rating
    }
  }
  if (pref.count) pref.avgDifficulty /= pref.count
  return pref
}

function difficultyToScore(diff) {
  if (diff === 'easy') return 1
  if (diff === 'medium') return 2
  if (diff === 'hard') return 3
  return 2
}

