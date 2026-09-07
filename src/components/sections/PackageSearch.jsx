import { useEffect, useRef, useState } from 'react'

// ponytail: archlinux.org serves no ACAO header, so direct browser fetch is blocked.
// r.jina.ai reader echoes CORS headers and strips to raw JSON (3-line prefix).
// If jina dies, swap for any CORS-friendly mirror or a small serverless proxy.
const API = 'https://r.jina.ai/https%3A%2F%2Farchlinux.org%2Fpackages%2Fsearch%2Fjson%2F%3Fname%3D'

const parseProxyPayload = (text) => {
  // Reader wraps payload with Title/URL Source/Markdown Content lines — cut to first '{'
  const start = text.indexOf('{')
  if (start < 0) throw new Error('no JSON in payload')
  return JSON.parse(text.slice(start))
}

export default function PackageSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [state, setState] = useState('idle') // idle | loading | done | error
  const abortRef = useRef(null)

  const q = query.trim()

  useEffect(() => {
    if (!q) return
    const t = setTimeout(async () => {
      setState('loading')
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const res = await fetch(`${API}${encodeURIComponent(q)}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = parseProxyPayload(await res.text())
        setResults(data.results ?? [])
        setState('done')
      } catch (err) {
        if (err.name !== 'AbortError') {
          setResults([])
          setState('error')
        }
      }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  const show = q && (state === 'done' || state === 'error')

  return (
    <section id="packages" className="section" aria-label="Package search">
      <div className="section-header reveal">
        <p className="section-tag">Packages</p>
        <h2 className="section-title">Search the repos, live</h2>
        <p className="section-lead">
          Every official package, straight from the Arch API. This is what
          <code className="pkg-inline-code"> pacman -Ss</code> sees.
        </p>
      </div>

      <div className="pkg-search-box reveal">
        <input
          type="search"
          className="pkg-input"
          placeholder="Try: firefox, neovim, linux…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search Arch Linux packages"
        />
        {state === 'loading' && <span className="pkg-spinner" aria-hidden="true" />}
      </div>

      {show && state === 'error' && (
        <p className="pkg-message reveal" role="alert">
          API unreachable — check your connection and try again.
        </p>
      )}

      {show && state === 'done' && results.length === 0 && (
        <p className="pkg-message reveal">
          No exact-name match. The AUR has 80,000 more — try the wiki.
        </p>
      )}

      {show && results.length > 0 && (
        <ul className="pkg-results reveal-stagger" aria-live="polite" aria-label={`Results for ${query}`}>
          {results.map((p) => (
            <li key={`${p.repo}/${p.pkgname}`}>
              <a
                className="pkg-card"
                href={`https://archlinux.org/packages/${p.repo}/${p.arch}/${p.pkgname}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="pkg-card-head">
                  <span className="pkg-name">{p.pkgname}</span>
                  <span className="pkg-repo">{p.repo}</span>
                </div>
                <p className="pkg-desc">{p.pkgdesc}</p>
                <div className="pkg-meta">
                  <span>{p.pkgver}-{p.pkgrel}</span>
                  <span>{p.arch[0]}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {!q && (
        <p className="pkg-message pkg-hint reveal">
          Type above — exact package names work best.
        </p>
      )}
    </section>
  )
}
