import { Component } from 'react'

/**
 * Catches render errors so a broken subtree degrades to a readable message
 * instead of a blank page. Deliberately dependency-free and unstyled beyond
 * the shared tokens — an error screen should never be the thing that breaks.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // No analytics sink in this project. Keep the console signal for whoever
    // is debugging, and make sure it is not swallowed silently.
    console.error('[arch-linux-site] render error', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="err" role="alert">
        <p className="err-h">$ fatal: this section failed to render</p>
        <p className="err-p">
          Something in the page threw while rendering. The rest of the site is
          unaffected — reload to try again, or open the console for the stack.
        </p>
        <button
          type="button"
          className="btn btn-line"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    )
  }
}
