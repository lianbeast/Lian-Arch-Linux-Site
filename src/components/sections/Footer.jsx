import { ArchLinuxIcon } from '../ui/Icons.jsx'

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <ArchLinuxIcon size={20} color="var(--cyan)" aria-hidden="true" />
          <span>Arch Linux</span>
        </div>
        <p className="footer-copy">
          Rolling since 2002. No product. Just people who care.
        </p>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="https://archlinux.org/" target="_blank" rel="noopener noreferrer">archlinux.org</a>
          <a href="https://wiki.archlinux.org/" target="_blank" rel="noopener noreferrer">wiki.archlinux.org</a>
          <a href="https://aur.archlinux.org/" target="_blank" rel="noopener noreferrer">aur.archlinux.org</a>
          <a href="https://github.com/archlinux" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}