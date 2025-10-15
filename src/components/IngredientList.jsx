export default function IngredientList({ ingredients, onRemove }) {
  if (!ingredients || ingredients.length === 0) {
    return <div className="text-gray-500">No ingredients yet.</div>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ing) => (
        <span key={ing} className="inline-flex items-center gap-2 bg-gray-100 border rounded-full px-3 py-1 text-sm">
          {ing}
          <button onClick={() => onRemove(ing)} aria-label={`Remove ${ing}`} className="text-gray-500 hover:text-gray-700">✕</button>
        </span>
      ))}
    </div>
  )
}


