import { playClick, playHover } from '../../utils/sounds'
import './SectionIndicator.css'

const sectionLabels = ['Home', 'Features', 'Install', 'Pacman', 'Community', 'Game']

export default function SectionIndicator({ sections, activeSection, onNavigate }) {
  return (
    <div className="section-indicator">
      {sectionLabels.map((label, i) => (
        <button
          key={i}
          className={`indicator-dot-wrap ${activeSection === i ? 'active' : ''}`}
          onClick={() => { playClick(); onNavigate(i) }}
          onMouseEnter={playHover}
          title={label}
        >
          <span className="indicator-dot" />
          <span className="indicator-label">{label}</span>
        </button>
      ))}
      <div className="indicator-line" />
    </div>
  )
}
