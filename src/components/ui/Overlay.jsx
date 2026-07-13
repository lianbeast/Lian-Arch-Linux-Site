import './Overlay.css'
import { MouseIcon } from './Icons'
import { SECTIONS as SECTION_NAMES } from '../../utils/constants'

const sectionContent = [
  {
    title: 'Arch Linux',
    subtitle: 'You. The machine. Nothing between.',
    description: 'A lightweight, x86_64 distribution built on a simple premise: you decide what belongs. No snap, no flatpak, no opinionated defaults. Just a base system and the entire AUR at your fingertips.',
  },
  {
    title: 'Features',
    subtitle: 'Everything you need. Nothing you didn\'t ask for.',
    description: 'Rolling releases mean you install once and stay current forever. Pacman is fast and surgical. The AUR puts 80,000+ community packages in your terminal. The Arch Wiki is the best documentation in Linux — and the only manual you\'ll ever need.',
  },
  {
    title: 'Installation',
    subtitle: 'Read the wiki. Know what you\'re doing.',
    description: 'Partition. Format. Pacstrap. Chroot. Generate fstab. Install bootloader. Configure. Reboot. Not a single click-through installer in sight — because understanding your system is the whole point.',
  },
  {
    title: 'Pacman',
    subtitle: 'The package manager that answers to you.',
    description: '-Syu keeps you on the bleeding edge. -R removes and doesn\'t leave a trace. -Ss finds anything in the official repos. and when the official repos aren\'t enough, yay brings the AUR to your terminal. No app store. No curated walled garden.',
  },
  {
    title: 'Community',
    subtitle: 'Not users. Contributors.',
    description: 'The wiki, the forums, the IRC channels, the mailing lists, the subreddit. People who read the source before they ask questions. Standards are high. Good documentation is expected. If that sounds like your kind of room, pull up a terminal.',
  },
  {
    title: 'PAC-MAN',
    subtitle: 'You use pacman. But can you BEAT Pacman?',
    description: '80,000+ dots. 4 ghosts. 3 lives. One arrow-key-controlled yellow circle. Show the Arch community you\'ve got what it takes.',
  },
]

export default function Overlay({ activeSection, onLaunchGame }) {
  const content = sectionContent[activeSection]
  const isGame = activeSection === 5

  return (
    <div className="overlay-3d">
      <div className="overlay-content" key={activeSection}>
        <span className="overlay-tag">{`[${SECTION_NAMES[activeSection]}]`}</span>
        <h1 className="overlay-title">{content.title}</h1>
        <p className="overlay-subtitle">{content.subtitle}</p>
        <p className="overlay-desc" style={isGame ? { marginBottom: '1rem' } : {}}>{content.description}</p>
        {isGame && (
          <button className="overlay-play-btn" onClick={onLaunchGame}>
            ▶ PLAY PAC-MAN
          </button>
        )}
      </div>

      <div className="overlay-hint">
        <span className="overlay-mouse"><MouseIcon size={14} color="currentColor" /></span>
        <span>Scroll to navigate</span>
      </div>
    </div>
  )
}
