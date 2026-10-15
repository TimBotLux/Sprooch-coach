// Enregistrement au micro avec MediaRecorder.
// L'audio reste en mémoire (URL blob) et disparaît à la fermeture de l'écran : rien n'est envoyé ni stocké.
import { useCallback, useEffect, useRef, useState } from 'react'

export type RecState = 'idle' | 'recording' | 'done' | 'denied' | 'unsupported'

export function useRecorder(onSaved?: (seconds: number) => void) {
  const supported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined'
  const [state, setState] = useState<RecState>(supported ? 'idle' : 'unsupported')
  const [url, setUrl] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const rec = useRef<MediaRecorder | null>(null)
  const t0 = useRef(0)
  const tick = useRef<number | undefined>(undefined)
  const savedCb = useRef(onSaved)
  savedCb.current = onSaved

  const stopTracks = () => rec.current?.stream.getTracks().forEach(t => t.stop())

  const clear = useCallback(() => {
    setUrl(u => { if (u) URL.revokeObjectURL(u); return null })
    setSeconds(0)
    setState(supported ? 'idle' : 'unsupported')
  }, [supported])

  const start = useCallback(async () => {
    if (!supported) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const chunks: Blob[] = []
      mr.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
      mr.onstop = () => {
        const sec = (Date.now() - t0.current) / 1000
        window.clearInterval(tick.current)
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
        setUrl(u => { if (u) URL.revokeObjectURL(u); return URL.createObjectURL(blob) })
        setSeconds(sec)
        setState('done')
        savedCb.current?.(sec)
      }
      rec.current = mr
      t0.current = Date.now()
      setSeconds(0)
      tick.current = window.setInterval(() => setSeconds((Date.now() - t0.current) / 1000), 250)
      mr.start()
      setState('recording')
    } catch {
      setState('denied')
    }
  }, [supported])

  const stop = useCallback(() => {
    if (rec.current && rec.current.state === 'recording') rec.current.stop()
  }, [])

  useEffect(() => () => {
    window.clearInterval(tick.current)
    if (rec.current && rec.current.state === 'recording') { rec.current.onstop = null; rec.current.stop() }
    stopTracks()
    setUrl(u => { if (u) URL.revokeObjectURL(u); return null })
  }, [])

  return { state, url, seconds, start, stop, clear, supported }
}
