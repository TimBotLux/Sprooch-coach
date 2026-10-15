// Scènes pour le module « Description d'image » (PRD §4.2).
// Les photos (libres de droits) se déposent dans public/images/ sous le nom indiqué.
// Tant qu'une photo manque, l'app affiche la description de la scène à la place.
export interface Scene {
  id: string
  file: string
  title: string
  description: string
  /** Mots utiles en luxembourgeois pour décrire la scène */
  words: [string, string][]
}

export const SCENES: Scene[] = [
  {
    id: 'marche', file: 'scene-marche.jpg', title: 'Au marché',
    description: 'Un marché en plein air : des stands de fruits et légumes, des clients qui font leurs courses.',
    words: [['de Maart', 'le marché'], ["d'Geméis", 'les légumes'], ["d'Uebst", 'les fruits'], ['kafen', 'acheter']],
  },
  {
    id: 'gare', file: 'scene-gare.jpg', title: 'À la gare',
    description: 'Un quai de gare : des voyageurs attendent le train avec leurs valises.',
    words: [['de Bahnhof', 'la gare'], ['den Zuch', 'le train'], ['waarden', 'attendre'], ["d'Reesend", 'les voyageurs']],
  },
  {
    id: 'famille', file: 'scene-famille.jpg', title: 'Repas en famille',
    description: 'Une famille mange ensemble autour d’une table, à la maison.',
    words: [["d'Famill", 'la famille'], ['iessen', 'manger'], ['den Dësch', 'la table'], ['doheem', 'à la maison']],
  },
  {
    id: 'parc', file: 'scene-parc.jpg', title: 'Au parc',
    description: 'Un parc en été : des enfants jouent, des gens se promènent.',
    words: [['de Park', 'le parc'], ["d'Kanner", 'les enfants'], ['spillen', 'jouer'], ['trëppelen', 'se promener']],
  },
  {
    id: 'bureau', file: 'scene-bureau.jpg', title: 'Au bureau',
    description: 'Des collègues travaillent dans un bureau, devant leurs ordinateurs.',
    words: [["d'Büro", 'le bureau'], ['schaffen', 'travailler'], ["d'Kolleegen", 'les collègues'], ['den Computer', "l'ordinateur"]],
  },
  {
    id: 'hiver', file: 'scene-hiver.jpg', title: 'En hiver',
    description: 'Une rue enneigée en hiver : des passants habillés chaudement.',
    words: [['de Wanter', "l'hiver"], ['Et schneit.', 'Il neige.'], ['kal', 'froid'], ['de Mantel', 'le manteau']],
  },
]

/** Canevas d'aide affichable (PRD §4.2). */
export const IMAGE_CANVAS: [string, string][] = [
  ['Wien?', 'Qui voit-on ? Combien de personnes ?'],
  ['Wou?', 'Où se passe la scène ?'],
  ['Wat?', 'Que font les personnes ?'],
  ['Wéi?', "Quelle est l'ambiance, la saison, la météo ?"],
  ['An Dir?', 'Comparez avec votre propre vie : « Ech … och / net … »'],
]

export const IMAGE_STARTERS = [
  'Op dësem Bild gesinn ech …',
  'Am Virdergrond … / Am Hannergrond …',
  'Ech mengen, datt …',
  'Dat erënnert mech un …',
]
