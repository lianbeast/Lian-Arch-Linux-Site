const cases = [
  { title: 'Desktop workstation', text: 'Full DEs, tiling WMs, a custom pipeline. You define what "works" means.' },
  { title: 'Server', text: 'Minimal base with full control. No bloat, no telemetry, no surprises.' },
  { title: 'Development', text: 'Latest kernels, compilers, containers. Whatever stack you chase, Arch has it fresh.' },
  { title: 'Tinkerer', text: 'Stripped to nothing, rebuilt from scratch. The distro for people who read source for fun.' },
  { title: 'Minimal laptop', text: 'A window manager, a browser, a terminal. Everything else is optional.' },
  { title: 'Containers & CI', text: 'Arch in Docker, Podman, or CI pipelines. Always the latest packages, always reproducible.' },
]

export default function UseCases() {
  return (
    <section id="usecases" className="section" aria-label="Use cases">
      <div className="section-header reveal">
        <h2 className="section-title">Every machine, every workload</h2>
        <p className="section-lead">
          From a 256 MB netbook to a 64-core server. Arch adapts.
        </p>
      </div>
      <div className="usecase-grid">
        {cases.map((c) => (
          <article key={c.title} className="usecase-card reveal">
            <h3 className="usecase-title">{c.title}</h3>
            <p className="usecase-text">{c.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}