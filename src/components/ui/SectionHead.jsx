/**
 * The document-style section header: a hairline rule, the running name, then the
 * claim. Extracted so the ten sections cannot drift apart — the markup used to be
 * copy-pasted into every one of them.
 *
 * The running index (`01 — about`) is drawn by CSS: `.sec-name::before` runs a
 * `counter()` over `.sec`, so this component takes no index prop.
 *
 * `lead` is optional and may be a node (the package search passes inline <code>).
 */
export default function SectionHead({ name, id, title, lead }) {
  return (
    <header className="sec-head">
      <p className="sec-name">{name}</p>
      <h2 id={id} className="sec-title">{title}</h2>
      {lead && <p className="sec-lead">{lead}</p>}
    </header>
  )
}
