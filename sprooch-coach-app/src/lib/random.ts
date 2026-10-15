export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

/** Tirage où les éléments prioritaires (mots ratés) passent en premier (répétition espacée). */
export function pickWithPriority<T>(all: readonly T[], isPriority: (x: T) => boolean, n: number): T[] {
  const first = shuffle(all.filter(isPriority))
  const rest = shuffle(all.filter(x => !isPriority(x)))
  return [...first, ...rest].slice(0, n)
}
