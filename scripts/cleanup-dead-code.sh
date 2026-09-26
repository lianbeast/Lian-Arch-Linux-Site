#!/usr/bin/env bash
#
# Removes the code and assets that the rewrite orphaned.
#
# These files are not imported by anything and not referenced by index.html, so
# they do not reach the production bundle — but they are still in the repo, and
# dead code in the repo is how the next person ends up confused about which
# hero is the real one.
#
# Run from anywhere:  bash scripts/cleanup-dead-code.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Removing five unused hero variants..."
rm -f src/components/sections/BootHero.jsx
rm -f src/components/sections/TopoHero.jsx
rm -f src/components/sections/RaceHero.jsx
rm -f src/components/sections/TilingHero.jsx
rm -f src/components/sections/GardenHero.jsx

echo "Removing the three.js backdrop (replaced by ArchContours.jsx)..."
rm -f src/components/ui/ArchMesh.jsx

echo "Removing the reduced-motion helper (now inlined at each call site)..."
rm -f src/utils/reducedMotion.js

echo "Removing font files no longer referenced by index.html..."
rm -f public/fonts/Inter-Regular.woff2
rm -f public/fonts/Inter-Medium.woff2
rm -f public/fonts/Inter-SemiBold.woff2
rm -f public/fonts/Inter-Bold.woff2
rm -f public/fonts/Rajdhani-Regular.woff2
rm -f public/fonts/Rajdhani-Medium.woff2
rm -f public/fonts/Rajdhani-SemiBold.woff2
rm -f public/fonts/Rajdhani-Bold.woff2
rm -f public/fonts/Michroma-Regular.woff2
rm -f public/fonts/Michroma-Regular.ttf
rm -f public/fonts/JetBrainsMono-Regular.ttf

echo "Removing stale planning docs..."
rm -rf docs/superpowers
rm -f branding_plan.md
rm -f docs/hero-backdrop.md

echo "Removing the generated hero clip (replaced by a live renderer)..."
# A pre-rendered clip cannot rotate continuously — it has to loop, and every
# loop shows a seam. Keeping this in public/ would ship a ~700 kB file nothing
# references, because everything in public/ is copied verbatim.
rm -f public/An_elegant__soothing_3D_animat_*.mp4
rm -f public/hero-mesh.mp4

echo "Removing the hero-scoped backdrop (superseded by the site-wide Backdrop)..."
# HeroBackdrop + HeroMesh drew a rotating ridge inside the hero. Backdrop.jsx
# now draws the whole landscape for the entire document, so all three of these
# are unreachable.
rm -f src/components/ui/HeroBackdrop.jsx
rm -f src/components/ui/HeroMesh.jsx
rm -f src/components/ui/ArchContours.jsx

echo
echo "Done. Remaining steps (this script does not run package managers):"
echo "  1. npm install          # drop three, @react-three/*, @anthropic-ai/claude-code"
echo "  2. npm run lint"
echo "  3. npm run build"
