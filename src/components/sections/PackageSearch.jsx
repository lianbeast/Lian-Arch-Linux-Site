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
 *
 * The proxy sees every query the reader types. If this page matters, run your
 * own.
 */

const DEFAULT_API =
  'https://r.jina.ai/https%3A%2F%2Farchlinux.org%2Fpackages%2Fsearch%2Fjson%2F%3Fname%3D'

const API_BASE = import.meta.env.VITE_PKG_API || DEFAULT_API
const TIMEOUT_MS = 8000
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400
const DEBOUNCE_MS = 250

/* The index returns every match, and a broad term like "linux" matches
   hundreds. Cap what gets rendered, and say so, rather than quietly truncating. */
const MAX_RESULTS = 25

/* A one-character query matches most of the archive and answers nothing. */
const MIN_QUERY = 2

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

/**
 * One line of prose describing whatever just happened.
 *
 * A plain function rather than a chain of assignments to a mutable variable:
 * every branch returns, so nothing is left uninitialised and there is no dead
 * initialiser for the linter to flag.
 */
function statusFor(view, q) {
  if (view.status === 'idle') return 'Type above. Exact package names work best.'
  if (view.status === 'short') return `Keep typing. ${MIN_QUERY} characters minimum.`
  if (view.status === 'loading') return 'querying the package index…'
  if (view.status === 'error') return view.error
  if (view.results.length === 0) {
    return `No exact-name match for "${q}". The AUR has 80,000 more. Try the wiki.`
  }
  if (view.total > view.results.length) {
    return `Showing the first ${view.results.length} of ${view.total} matches for "${q}".`
  }
  return `${view.total} ${view.total === 1 ? 'match' : 'matches'} for "${q}".`
}

/* The three states that are derived rather than stored. Hoisted so they are
   stable identities across renders. */
const IDLE = { status: 'idle', results: [], total: 0, error: '' }
const LOADING = { status: 'loading', results: [], total: 0, error: '' }
const TOO_SHORT = { status: 'short', results: [], total: 0, error: '' }

export default function PackageSearch() {
  const [query, setQuery] = useState('')
  /* `forQuery` pins a result set to the query that produced it. That is what
     lets a settled result be told apart from a pending keystroke without
     storing a separate loading flag. */
  const [state, setState] = useState({ forQuery: '', ...IDLE })

  const q = query.trim()

  useEffect(() => {
    // Nothing to fetch. Deliberately no setState here: an empty or too-short
    // box is derived below rather than synchronised into state from inside an
    // effect, which would cause a cascading render on every keystroke.
    if (q.length < MIN_QUERY) return

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
        const all = Array.isArray(data.results) ? data.results : []
        setState({
          forQuery: q,
          status: 'done',
          results: all.slice(0, MAX_RESULTS),
          total: all.length,
          error: '',
        })
      } catch (err) {
        if (cancelled) return
        if (err.name === 'AbortError') {
          // Superseded by a newer keystroke — stay quiet. A real timeout speaks.
          if (timedOut) {
            setState({
              forQuery: q,
              status: 'error',
              results: [],
              total: 0,
              error: MESSAGES.timeout,
            })
          }
          return
        }
        setState({ forQuery: q, status: 'error', results: [], total: 0, error: err.message })
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

  /* Derived view: an empty box is idle, a query below the minimum is its own
     state, and a query whose results have not arrived yet reads as loading —
     including during the debounce window. */
  const view = !q
    ? IDLE
    : q.length < MIN_QUERY
      ? TOO_SHORT
      : state.forQuery === q
        ? state
        : LOADING

  /**
   * Rendered into a single persistent live region rather than a fresh element
   * per state: a `role="status"` node mounted with its text already inside it
   * is announced unreliably, whereas changing the text of one that is already
   * on the page is not. The result list itself is deliberately NOT a live
   * region — twenty-five packages read aloud is not a useful announcement.
   */
  const status = statusFor(view, q)

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
          aria-describedby="pkg-status"
        />
      </div>

      <div className="reveal">
        <p className="pkg-state" id="pkg-status" role="status">
          {status}
          {view.status === 'error' && (
            <>
              {' '}
              <a href="https://archlinux.org/packages/" target="_blank" rel="noopener noreferrer">
                Search archlinux.org instead
              </a>
              .
            </>
          )}
        </p>

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
