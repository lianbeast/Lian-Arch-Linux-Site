import { ArchLinuxIcon } from '../ui/Icons.jsx'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-inner">
        <div>
          <div className="foot-brand">
            <ArchLinuxIcon size={18} color="var(--brand)" />
            <span>Arch Linux</span>
          </div>
          <p className="foot-note">
            An unofficial fan page. Not affiliated with the Arch Linux project.
          </p>
        </div>

        <nav className="foot-links" aria-label="Footer">
          <a href="https://archlinux.org/" target="_blank" rel="noopener noreferrer">archlinux.org</a>
          <a href="https://wiki.archlinux.org/" target="_blank" rel="noopener noreferrer">wiki</a>
          <a href="https://aur.archlinux.org/" target="_blank" rel="noopener noreferrer">aur</a>
          <a href="https://gitlab.archlinux.org/" target="_blank" rel="noopener noreferrer">gitlab</a>
        </nav>
      </div>
    </footer>
  )
}
