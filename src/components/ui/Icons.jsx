/**
 * Only the mark is still needed.
 *
 * This file used to carry eleven inline icons, nine of which were unreferenced
 * after the card grids were removed. Dead icons are dead weight in the bundle
 * and in the reader's head, so they are gone.
 *
 * The path is the Arch Linux mark: a peak with a triangular notch cut from the
 * base, which is what the logo actually is.
 */
export function ArchLinuxIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 1 L1 23 h4.2 L12 9.6 l6.8 13.4 H23 Z" />
    </svg>
  )
}
