import { ArchLinuxIcon } from './Icons.jsx'

// Pixel-perfect recreation of production .card (features section).
// Token-driven: bg-card/border/radius-lg + ::before top-edge line via CSS class.
export function Card({ title, children }) {
  return (
    <article className="card">
      <span className="card-icon"><ArchLinuxIcon size={24} /></span>
      <h3 className="card-title">{title}</h3>
      <p className="card-text">{children}</p>
    </article>
  )
}
