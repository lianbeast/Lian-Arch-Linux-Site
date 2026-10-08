import { useEffect, useRef, useState } from 'react'
import SectionHead from '../ui/SectionHead'

/**
 * Download options, as a list rather than four clickable cards.
 *
 * The old version wrapped an <a> inside a <button>, which is invalid HTML and
 * breaks keyboard activation, and toggled an "active" class that did nothing.
 * These are plain rows with one real link each.
 *
 * No version numbers are printed. A hardcoded release date is stale within a
 * month and this audience checks — so the copy describes the images and the
 * link goes to the canonical page, which is always current.
 */
const IMAGES = [
  {
    name: 'Latest release',
    text: 'The current ISO, built from the latest package snapshot. Boots to a live environment.',
    href: 'https://archlinux.org/download/',
    cta: 'Download',
  },
  {
    name: 'Netboot',
    text: 'A minimal image that pulls the rest over the network. For fast or repeated installs.',
    href: 'https://archlinux.org/download/',
    cta: 'Download',
  },
  {
    name: 'archinstall',
    text: 'The same image with the official guided installer. The manual path stays available.',
    href: 'https://wiki.archlinux.org/title/Archinstall',
    cta: 'Read the docs',
  },
  {
    name: 'Containers & bootstrap',
    text: 'Tarballs and container images for CI, image builds, and throwaway environments.',
    href: 'https://wiki.archlinux.org/title/Docker',
    cta: 'Read the docs',
  },
]

const COMMANDS = [
  {
    id: 'write',
    label: 'Write the ISO to a USB stick — replace sdX with your device:',
    value: 'sudo dd bs=4M if=archlinux-x86_64.iso of=/dev/sdX status=progress oflag=sync',
  },
  {
    id: 'verify',
    label: 'Verify the download before you trust it:',
    value: 'sha256sum -c archlinux-x86_64.iso.sha256',
  },
]

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  // Clear a pending reset on unmount, or the timeout fires into a dead component.
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard is unavailable over plain HTTP or when permission is denied.
      // The command stays selectable by hand, so this is a deliberate no-op.
    }
  }

  return (
    <button type="button" className="cmd-copy" onClick={copy}>
      {copied ? 'copied' : 'copy'}
    </button>
  )
}

export default function Download() {
  return (
    <section id="download" className="sec" aria-labelledby="download-title">
      <SectionHead
        name="download"
        id="download-title"
        title="Choose your image"
        lead="Official images, netboot, and container bases. Verify the signature before you install anything."
      />

      <div className="dl-list reveal-stagger">
        {IMAGES.map((img) => (
          <article className="dl-item" key={img.name}>
            <h3 className="dl-name">{img.name}</h3>
            <a
              className="btn btn-line dl-go"
              href={img.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {img.cta}
            </a>
            <p className="dl-text">{img.text}</p>
          </article>
        ))}
      </div>

      <div className="cmds reveal">
        <h3 className="cmds-h">Put it on a USB stick</h3>
        {COMMANDS.map((c) => (
          <div className="cmd-row" key={c.id}>
            <p className="cmd-label">{c.label}</p>
            <div className="cmd-box">
              <code>{c.value}</code>
              <CopyButton value={c.value} />
            </div>
          </div>
        ))}
        <p className="cmd-note">
          Substitute the real filename from your download. Prefer a GUI?{' '}
          <a
            href="https://wiki.archlinux.org/title/USB_flash_installation_medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            The wiki lists those too
          </a>
          .
        </p>
      </div>
    </section>
  )
}
