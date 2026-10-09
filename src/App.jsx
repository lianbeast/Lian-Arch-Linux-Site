import ErrorBoundary from './components/ui/ErrorBoundary'
import Backdrop from './components/ui/Backdrop'
import Navbar from './components/ui/Navbar'
import BackToTop from './components/ui/BackToTop'
import Tweaks from './components/ui/Tweaks'
import ScrollProgress from './components/ui/ScrollProgress'
import useReveal from './hooks/useReveal'
import useActiveSection from './hooks/useActiveSection'

import SpecHero from './components/sections/SpecHero'
import About from './components/sections/About'
import History from './components/sections/History'
import Features from './components/sections/Features'
import Terminal from './components/sections/Terminal'
import PackageSearch from './components/sections/PackageSearch'
import Download from './components/sections/Download'
import Architectures from './components/sections/Architectures'
import UseCases from './components/sections/UseCases'
import Faq from './components/sections/Faq'
import Community from './components/sections/Community'
import Footer from './components/sections/Footer'

/**
 * Composition only.
 *
 * The chrome (nav, progress bar, back-to-top, tweaks) and the scroll utilities
 * used to live in this file, which made one module own both the page's argument
 * and four unrelated widgets. They now live in `components/ui` and `hooks`;
 * what is left here is the order of the argument, which is the only thing
 * App.jsx should be deciding.
 */
export default function App() {
  const active = useActiveSection()
  useReveal()

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>

      {/* Fixed behind everything, at z-index 0. `main`, `.nav`, `.foot` and the
          fixed controls all sit above it. */}
      <Backdrop />

      <ScrollProgress />

      {/* Film grain texture — fixed overlay, 4% opacity, mix-blend-mode overlay.
          Borrowed from the Debian site's register. Purely decorative. */}
      <div className="grain" aria-hidden="true" />

      {/* HUD corner frame — four brand-bracket corners, like a CRT or terminal.
          Purely decorative, zero JS. */}
      <div className="hud" aria-hidden="true">
        <div className="hud-corner top-left" />
        <div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" />
        <div className="hud-corner bottom-right" />
      </div>

      <Navbar active={active} />
      <BackToTop />
      <Tweaks />

      {/* One boundary per section: a single broken subtree degrades to a
          readable message instead of taking the whole page down with it. */}
      <main id="main-content">
        <ErrorBoundary><SpecHero /></ErrorBoundary>
        <ErrorBoundary><About /></ErrorBoundary>
        <ErrorBoundary><History /></ErrorBoundary>
        <ErrorBoundary><Features /></ErrorBoundary>
        <ErrorBoundary><Terminal /></ErrorBoundary>
        <ErrorBoundary><PackageSearch /></ErrorBoundary>
        <ErrorBoundary><Download /></ErrorBoundary>
        <ErrorBoundary><Architectures /></ErrorBoundary>
        <ErrorBoundary><UseCases /></ErrorBoundary>
        <ErrorBoundary><Faq /></ErrorBoundary>
        <ErrorBoundary><Community /></ErrorBoundary>
      </main>

      <ErrorBoundary><Footer /></ErrorBoundary>
    </>
  )
}
