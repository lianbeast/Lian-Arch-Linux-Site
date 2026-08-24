const isos = [
  {
    label: 'Latest ISO',
    version: '2026.08.01',
    text: 'The current release, built from the latest snapshot.',
    active: true,
  },
  {
    label: 'Netboot',
    version: '2026.08.01',
    text: 'Minimal environment for network installation.',
    active: false,
  },
  {
    label: 'archinstall ISO',
    version: '2026.08.01',
    text: 'Guided installer ISO for a faster setup.',
    active: false,
  },
  {
    label: 'Container & bootstrap',
    version: '2026.08.01',
    text: 'Tarballs and container images for advanced users.',
    active: false,
  },
]

export default function Download() {
  return (
    <section id="download" className="section" aria-label="Download">
      <div className="section-header reveal">
        <h2 className="section-title">Choose your flavor</h2>
        <p className="section-lead">
          Official images, netboot, and container bases. Verify with PGP.
        </p>
      </div>
      <div className="version-grid reveal" aria-label="Download options">
        {isos.map((iso) => (
          <button
            key={iso.label}
            type="button"
            className={`version-card ${iso.active ? 'active' : ''}`}
            role="button"
            aria-pressed={iso.active}
            onClick={(e) => {
              // Toggle active state (simplified for demo)
              const btn = e.currentTarget;
              const active = btn.classList.toggle('active');
              btn.setAttribute('aria-pressed', active);
            }}
          >
            <div className="version-header">
              <h3 className="version-title">{iso.label}</h3>
              <span className="version-tag">{iso.version}</span>
            </div>
            <p className="version-text">{iso.text}</p>
          </button>
        ))}
      </div>
    </section>
  )
}