import { useRef, useState } from 'react'
import * as mobilenet from '@tensorflow-models/mobilenet'
import '@tensorflow/tfjs'

export default function ImageIngredientInput({ onAdd }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      await img.decode()
      const model = await mobilenet.load()
      const predictions = await model.classify(img)
      const labels = predictions.slice(0, 4).map(p => p.className)
      onAdd(Array.from(new Set(labels)))
    } catch (err) {
      setError('Failed to analyze image. Try another image or add manually.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
      {loading && <div>Scanning image…</div>}
      {error && <div role="alert">{error}</div>}
    </div>
  )
}


