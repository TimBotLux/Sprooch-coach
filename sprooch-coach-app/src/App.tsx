import { useEffect } from 'react'
import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Icon } from './components/Icon'
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

const TABS: [string, string, string][] = [
  ['/', 'home', "Aujourd'hui"],
  ['/pas-a-pas', 'steps', 'Pas à pas'],
  ['/vocabulaire', 'cards', 'Vocabulaire'],
  ['/lexique', 'book', 'Lexique'],
  ['/plus', 'more', 'Plus'],
]
const MORE = ['/plus', '/simulation', '/image', '/revisions', '/grammaire', '/progression', '/reglages']

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Shell() {
  const { state } = useStore()
  const { pathname } = useLocation()
  if (!state.profile.onboarded) return <><div className="flag" aria-hidden="true"><span /><span /><span /></div><Onboarding /></>

  return (
    <>
      <ScrollToTop />
      <div className="flag" aria-hidden="true"><span /><span /><span /></div>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/pas-a-pas" element={<PasAPas />} />
          <Route path="/vocabulaire" element={<Vocabulaire />} />
          <Route path="/lexique" element={<Lexique />} />
          <Route path="/plus" element={<Plus />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/image" element={<ImagePage />} />
          <Route path="/revisions" element={<Revisions />} />
          <Route path="/grammaire" element={<Grammaire />} />
          <Route path="/progression" element={<Progression />} />
          <Route path="/reglages" element={<Reglages />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </main>
      <nav className="tabbar" aria-label="Navigation principale">
        <ul>
          {TABS.map(([to, icon, label]) => {
            const active = to === '/plus' ? MORE.includes(pathname) : pathname === to
            return (
              <li key={to}>
                <NavLink to={to} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined}>
                  <Icon name={icon} />{label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
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
