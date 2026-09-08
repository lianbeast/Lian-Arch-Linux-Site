// Production .btn-primary / .btn-secondary — gradient + sheen sweep, focus-visible accent.
export function Button({ variant = 'primary', href = '#', children }) {
  return (
    <a className={`btn btn-${variant}`} href={href}>{children}</a>
  )
}

// Section eyebrow: Michroma, uppercase, 24px rule prefix (::before on .section-tag).
export function SectionTag({ children }) {
  return <p className="section-tag">{children}</p>
}

// Section heading with gradient underline (::after on .section-title).
export function SectionTitle({ children }) {
  return <h2 className="section-title">{children}</h2>
}
