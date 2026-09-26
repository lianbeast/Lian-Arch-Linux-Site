import { useEffect, useState } from 'react'

/**
 * Live package search against the official Arch package index.
 *
 * archlinux.org sends no Access-Control-Allow-Origin header, so a browser
 * cannot call it directly. Requests go through a text-echo proxy that adds the
 * header back. That proxy is the only external runtime dependency on this
 * site, so it is treated as one:
 *
 *   - the base URL comes from VITE_PKG_API, so it can be pointed at a proxy
 *     you control without editing this file
 *   - every failure mode maps to a message the reader can act on
 *   - transient failures retry with backoff; client errors never retry
 *   - the section degrades to a link rather than an empty box
 */

const DEFAULT_API =
  'https://r.jina.ai/https%3A%2F%2Farchlinux.org%2Fpackages%2Fsearch%2Fjson%2F%3Fname%3D'

const API_BASE = import.meta.env.VITE_PKG_API || DEFAULT_API
const TIMEOUT_MS = 8000
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400
const DEBOUNCE_MS = 250

const MESSAGES = {
  busy: 'The package index is busy right now. Try again in a moment.',
  rejected: 'The package index rejected that search.',
  malformed: 'The package index returned something unexpected.',
  unreachable: 'Could not reach the package index. Check your connection.',
  timeout: 'The package index took too long to answer.',
}

class SearchError extends Error {
  constructor(code, retryable) {
    super(MESSAGES[code] ?? 'Search failed.')
    this.name = 'SearchError'
    this.code = code
    this.retryable = retryable
  }
}

/** The proxy prefixes its own metadata, so cut to the first brace. */
const parsePayload = (text) => {
  const start = text.indexOf('{')
  if (start < 0) throw new SearchError('malformed', true)
  try {
    return JSON.parse(text.slice(start))
  } catch {
    throw new SearchError('malformed', true)
  }
}

async function requestOnce(query, signal) {
  const res = await fetch(`${API_BASE}${encodeURIComponent(query)}`, { signal })
  if (res.status === 429 || res.status >= 500) throw new SearchError('busy', true)
  if (!res.ok) throw new SearchError('rejected', false)
  return parsePayload(await res.text())
}

async function search(query, signal) {
  let lastError
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await requestOnce(query, signal)
    } catch (err) {
      // A cancelled request is not a failure — let it propagate untouched.
      if (err.name === 'AbortError') throw err
      const wrapped = err instanceof SearchError ? err : new SearchError('unreachable', true)
      lastError = wrapped
      if (!wrapped.retryable) throw wrapped
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)))
      }
    }
  }
  throw lastError
}

/** `arch` comes back as an array, and occasionally holds more than one value. */
const archList = (value) => (Array.isArray(value) ? value : [value]).filter(Boolean)

/* The two states that are derived rather than stored. Hoisted so they are
   stable identities across renders. */
const IDLE = { status: 'idle', results: [], error: '' }
const LOADING = { status: 'loading', results: [], error: '' }

export default function PackageSearch() {
  const [query, setQuery] = useState('')
  /* `forQuery` pins a result set to the query that produced it. That is what
     lets a settled result be told apart from a pending keystroke without
     storing a separate loading flag. */
  const [state, setState] = useState({ forQuery: '', status: 'idle', results: [], error: '' })

  const q = query.trim()

  useEffect(() => {
    // Nothing to fetch. Deliberately no setState here: an empty box is derived
    // below rather than synchronised into state from inside an effect, which
    // would cause a cascading render on every keystroke that clears the field.
    if (!q) return

    let cancelled = false
    let timedOut = false
    const ctrl = new AbortController()
    const timer = setTimeout(() => {
      timedOut = true
      ctrl.abort()
    }, TIMEOUT_MS)

    const run = async () => {
      try {
        const data = await search(q, ctrl.signal)
        if (cancelled) return
        setState({
          forQuery: q,
          status: 'done',
          results: Array.isArray(data.results) ? data.results : [],
          error: '',
        })
      } catch (err) {
        if (cancelled) return
        if (err.name === 'AbortError') {
          // Superseded by a newer keystroke — stay quiet. A real timeout speaks.
          if (timedOut) {
            setState({ forQuery: q, status: 'error', results: [], error: MESSAGES.timeout })
          }
          return
        }
        setState({ forQuery: q, status: 'error', results: [], error: err.message })
      } finally {
        clearTimeout(timer)
      }
    }

    const debounce = setTimeout(run, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(debounce)
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q])

  /* Derived view: an empty box is idle, and a query whose results have not
     arrived yet reads as loading — including during the debounce window. */
  const view = !q ? IDLE : state.forQuery === q ? state : LOADING

  return (
    <section id="packages" className="sec" aria-labelledby="packages-title">
      <header className="sec-head">
        <p className="sec-name">packages</p>
        <h2 id="packages-title" className="sec-title">
          Search the repos, live
        </h2>
        <p className="sec-lead">
          Every official package, straight from the Arch index. This is what
          <code className="k"> pacman -Ss</code> sees.
        </p>
      </header>

      <div className="pkg-box reveal">
        <input
          type="search"
          className="pkg-input"
          placeholder="Try: firefox, neovim, linux"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search Arch Linux packages"
        />
      </div>

      <div className="reveal" aria-live="polite">
        {view.status === 'idle' && (
          <p className="pkg-state">Type above. Exact package names work best.</p>
        )}

        {view.status === 'loading' && (
          <p className="pkg-state">querying the package index…</p>
        )}

        {view.status === 'error' && (
          <p className="pkg-state">
            {view.error}{' '}
            <a href="https://archlinux.org/packages/" target="_blank" rel="noopener noreferrer">
              Search archlinux.org instead
            </a>
            .
          </p>
        )}

        {view.status === 'done' && view.results.length === 0 && (
          <p className="pkg-state">
            No exact-name match for <code>{q}</code>. The AUR has 80,000 more —
            try the wiki.
          </p>
        )}

        {view.status === 'done' && view.results.length > 0 && (
          <ul className="pkg-list">
            {view.results.map((p) => {
              const arches = archList(p.arch)
              return (
                <li key={`${p.repo}/${p.pkgname}`}>
                  <a
                    className="pkg-item"
                    href={`https://archlinux.org/packages/${p.repo}/${arches[0] ?? ''}/${p.pkgname}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="pkg-name">{p.pkgname}</span>
                    <span className="pkg-repo">{p.repo}</span>
                    <span className="pkg-desc">{p.pkgdesc}</span>
                    <span className="pkg-meta">
                      <span>{p.pkgver}-{p.pkgrel}</span>
                      <span>{arches.join(', ')}</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
