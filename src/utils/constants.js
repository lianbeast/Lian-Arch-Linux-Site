/**
 * Single source of truth for section order.
 *
 * SECTIONS drives both the render order in App.jsx and the active-section
 * observer, so the two can no longer drift apart. NAV_LINKS is deliberately a
 * short subset — a landing page nav is a map, not a table of contents.
 */
export const SECTIONS = [
  'home',
  'about',
  'history',
  'features',
  'terminal',
  'packages',
  'download',
  'architectures',
  'usecases',
  'faq',
  'community',
]

export const NAV_LINKS = [
  { id: 'about', label: 'about' },
  { id: 'features', label: 'features' },
  { id: 'terminal', label: 'terminal' },
  { id: 'community', label: 'community' },
]
