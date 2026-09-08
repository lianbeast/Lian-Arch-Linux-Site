// Mockup 03: hero as PKGBUILD spec sheet. Left = the recipe, right = the margin notes.
const SPEC_LINES = [
  { num: 1,  indent: '', code: '# The Arch Way, in plain text', cls: 'cm' },
  { num: 2,  indent: '', code: '', cls: '' },
  { num: 3,  indent: '', code: '<span class="big type-anim">Arch <span class="hl">Linux</span></span>', cls: '' },
  { num: 4,  indent: '', code: '', cls: '' },
  { num: 5,  indent: '', code: '<span class="kw">pkgname</span>=<span class="type-anim"><span>your-machine</span></span>', cls: '' },
  { num: 6,  indent: '', code: '<span class="kw">pkgver</span>=<span class="type-anim"><span>2026.09.08</span></span>', cls: '' },
  { num: 7,  indent: '', code: '<span class="kw">pkgrel</span>=<span class="type-anim"><span>1</span></span>', cls: '' },
  { num: 8,  indent: '', code: '<span class="kw">arch</span>=(<span class="type-anim"><span>\'x86_64\'</span></span>)', cls: '' },
  { num: 9,  indent: '', code: '<span class="cm comment-pin"># build() is called by makepkg, actually</span>', cls: '' },
  { num: 10, indent: '', code: '<span class="kw">depends</span>=(<span class="type-anim"><span>\'you\'</span></span>)', cls: '' },
]

const MARGIN_NOTES = [
  {
    title: 'Plain text, or it doesn\'t exist',
    body: 'Everything Arch ships can be read. Packages are build recipes, configs are files, the wiki explains why.',
    ref: 'line 1',
  },
  {
    title: 'You are the dependency',
    body: 'The system assumes competence and rewards it. Nothing is pre-decided for you, which means nothing is hidden from you.',
    ref: 'depends',
  },
  {
    title: 'Today\'s version is the only version',
    body: 'Rolling release: one <code>pacman -Syu</code> and your pkgver is current. The date is the version, the version is the date.',
    ref: 'pkgver',
  },
]

const BUILD_FIELDS = [
  { key: 'release_model', desc: 'One command, always current. No "LTS or bleeding edge?" dilemma: the edge is the release.', val: 'rolling' },
  { key: 'base_install', desc: 'Under 200 packages. You add what you use, and you know why each one is there.', val: '~2 GB' },
  { key: 'init', desc: 'systemd by default, replaceable by design. The choice ships as a choice.', val: 'yours' },
  { key: 'documentation', desc: 'The Arch Wiki: the documentation other distros link to when their own runs out.', val: '55k+ articles' },
  { key: 'aur_routes', desc: '80,000+ community-maintained PKGBUILDs. Every one readable before you run it.', val: '80,000+' },
]

export default function SpecHero() {
  return (
    <section id="home" className="section hero spec-hero" aria-label="Hero">
      <div className="spec-code">
        <div className="spec-gutter" aria-hidden="true">
          {SPEC_LINES.map((l) => (
            <span key={l.num} className="lineno" style={{ '--n': l.num }}>{l.num}</span>
          ))}
        </div>
        <div className="spec-lines" role="code">
          {SPEC_LINES.map((l, i) => (
            <div key={i} className={`spec-line ${l.cls}`} dangerouslySetInnerHTML={{ __html: l.code }} />
          ))}
        </div>
      </div>

      <div className="spec-margin">
        {MARGIN_NOTES.map((note, i) => (
          <div key={i} className="margin-note">
            <h3>{note.title}</h3>
            <p dangerouslySetInnerHTML={{ __html: note.body }} />
            <span className="ref">see <b>{note.ref}</b></span>
          </div>
        ))}
        <div className="spec-ctas">
          <a className="btn btn-primary" href="#fields">View build fields</a>
          <a className="btn" href="https://wiki.archlinux.org/" target="_blank" rel="noopener noreferrer">Read the wiki</a>
        </div>
      </div>

      <section className="fields" id="fields">
        <div className="fields-head">
          <span className="fields-kicker">Build fields</span>
          <h2>Every field is a promise. Each one checkable.</h2>
        </div>
        <div className="field-table">
          {BUILD_FIELDS.map((f, i) => (
            <div key={i} className="field-row">
              <span className="field-key">{f.key}</span>
              <p className="field-desc">{f.desc}</p>
              <span className="field-val">{f.val}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}