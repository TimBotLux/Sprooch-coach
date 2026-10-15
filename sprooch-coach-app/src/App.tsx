// Architecture selon la charte graphique (design/Charte-graphique-Sprooch-Coach.html, §5) :
// une seule colonne, un en-tête commun (titre, 3 anneaux, avertissement) et trois onglets
// Pas à pas · Vocabulaire · Lexique. Les autres modules s'ouvrent depuis le menu « Plus ».
import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { Icon } from './components/Icon'
import { Rings } from './components/Rings'
import { StoreProvider, useStore } from './lib/store'
import { Grammaire } from './pages/Grammaire'
import { ImagePage } from './pages/Image'
import { Lexique } from './pages/Lexique'
import { Onboarding } from './pages/Onboarding'
import { PasAPas } from './pages/PasAPas'
import { Plus } from './pages/Plus'
import { Progression } from './pages/Progression'
import { Reglages } from './pages/Reglages'
import { Revisions } from './pages/Revisions'
import { Simulation } from './pages/Simulation'
import { Today } from './pages/Today'
import { Vocabulaire } from './pages/Vocabulaire'

const TABS: [string, string][] = [
  ['/', 'Pas à pas'],
  ['/vocabulaire', 'Vocabulaire'],
  ['/lexique', 'Lexique'],
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/** En-tête commun aux trois onglets. */
function AppHeader({ pathname }: { pathname: string }) {
  return (
    <>
      <header className="stack">
        <div className="app-head">
          <h1>Sprooch Coach<small>Préparez l'oral du Sproochentest : on répond à voix haute, jamais par écrit.</small></h1>
          <Link className="icon-btn" to="/plus" aria-label="Plus : plan du jour, simulation, image, grammaire, progression, réglages">
            <Icon name="more" />
          </Link>
        </div>
        <Rings />
        <div className="note">Prototype. Les phrases en luxembourgeois sont un premier jet à faire relire par un natif. L'écoute des questions viendra avec des enregistrements de locuteurs natifs (la voix de synthèse déformait la prononciation).</div>
      </header>
      <nav className="tabs" aria-label="Sections">
        {TABS.map(([to, label]) => (
          <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
    </>
  )
}

function Shell() {
  const { state } = useStore()
  const { pathname } = useLocation()
  if (!state.profile.onboarded) return <><div className="flag" aria-hidden="true"><span /><span /><span /></div><Onboarding /></>

  const isTab = TABS.some(([to]) => to === pathname)
  return (
    <>
      <ScrollToTop />
      <div className="flag" aria-hidden="true"><span /><span /><span /></div>
      <main className="wrap">
        {isTab
          ? <AppHeader pathname={pathname} />
          : <Link className="back" to={pathname === '/plus' ? '/' : '/plus'}><Icon name="back" />{pathname === '/plus' ? 'Retour aux exercices' : 'Plus'}</Link>}
        <Routes>
          <Route path="/" element={<PasAPas />} />
          <Route path="/vocabulaire" element={<Vocabulaire />} />
          <Route path="/lexique" element={<Lexique />} />
          <Route path="/plus" element={<Plus />} />
          <Route path="/aujourdhui" element={<Today />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/revisions" element={<Revisions />} />
          <Route path="/grammaire" element={<Grammaire />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/reglages" element={<Reglages />} />
          <Route path="*" element={<PasAPas />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Shell />
      </HashRouter>
    </StoreProvider>
  )
}
