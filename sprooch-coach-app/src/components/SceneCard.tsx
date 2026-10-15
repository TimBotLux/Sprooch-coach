import { useState } from 'react'
import type { Scene } from '../data/images'

/** Photo de la scène si elle existe dans public/images/, sinon sa description. */
export function SceneVisual({ scene, large = false }: { scene: Scene; large?: boolean }) {
  const [missing, setMissing] = useState(false)
  if (missing) {
    return <div className="scene-ph" style={large ? { fontSize: '1rem' } : undefined}>{scene.description}</div>
  }
  return <img className="scene-img" src={`./images/${scene.file}`} alt={scene.description} onError={() => setMissing(true)} />
}
