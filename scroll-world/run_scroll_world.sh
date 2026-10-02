#!/usr/bin/env bash
  set -euo pipefail

  # ------------------------------------------------------------
  # 0.  Make sure all dive‑prompt files exist
  # ------------------------------------------------------------
  mkdir -p prompts
  SCENES=(
  "Source Code Landscape"
  "Compilation Foundry"
  "Package Repository Vault"
  "Pacman Action"
  "Running System Architecture"
  "Community & AUR Plaza"
  )
  for i in {0..5}; do
    if [[ ! -f prompts/dive_${i}.txt ]]; then
      tee prompts/dive_${i}.txt > /dev/null <<EOF
  Single continuous cinematic camera move, no cuts. Begin high and far, glide forward into the ${SCENES[$i]}, smoothly continue forward and
  gently approach the next scene, ending with a slight pause before the view transitions.
  EOF
    fi
  done

  # ------------------------------------------------------------
  # 1.  Configuration & Shortcuts
  # ------------------------------------------------------------
  DIR="/home/arch/Applications/Play-Site/arch-linux-site/scroll-world"
  cd "$DIR"

  # full absolute path to stills (they must already exist)
  STILL_DIR="$(realpath stiffs)"

  # sanity‑check
  for i in {0..5}; do
    if [[ ! -r "$STILL_DIR/still_${i}.png" ]]; then
      echo "❌  Still file missing: $STILL_DIR/still_${i}.png"
      echo "Generate all stills first (see the ’Generate stills’ section below) and re‑run."
      exit 1
    fi
  done

  # Create working folders
  mkdir -p videos frames mobile encoded assets

  # Symlink stills so the demo can reference them
  ln -sf "$STILL_DIR"/*.png assets/

  # ------------------------------------------------------------
  # 2.  Generate Desktop dives (Architecture A – forward only)
  # ------------------------------------------------------------
  for i in {0..5}; do
    if [[ $i -eq 0 ]]; then
      START="${STILL_DIR}/still_${i}.png"
    else
      START="frames/dive_${i-1}_last.png"
    fi
    PROMPT="$(sed -n 1p prompts/dive_${i}.txt)"
    echo "▶️  Generating desktop dive $i – start image: $START"

    # ---- PLACEHOLDER ----
    # Replace the line below with your actual higgsfield call
    # higgsfield generate create kling3_0 \
    #   --prompt "$PROMPT" \
    #   --aspect_ratio 16:9 \
    #   --duration 10 \
    #   --start_image "$START" \
    #   --mode std \
    #   --sound off \
    #   --wait \
    #   --json > videos/dive_${i}.json

    # Dummy MP4 – keep the pipeline running
    echo "placeholder for dive_${i}.mp4" > videos/dive_${i}.mp4
  done

  # ------------------------------------------------------------
  # 3.  Extract last frame of each dive
  # ------------------------------------------------------------
  for i in {0..5}; do
    ffmpeg -sseof -0.15 -i videos/dive_${i}.mp4 -frames:v 1 -q:v 2 "frames/dive_${i}_last.png"
  done

  # ------------------------------------------------------------
  # 4.  Generate mobile pulls (9:16)
  # ------------------------------------------------------------
  for i in {0..5}; do
    if [[ $i -eq 0 ]]; then
      START="${STILL_DIR}/still_${i}.png"
    else
      START="mobile/dive_${i-1}_last.png"
    fi
    PROMPT="$(sed -n 1p prompts/dive_${i}.txt)"
    echo "▶️  Generating mobile dive $i – 9:16 – start image: $START"

    # ---- PLACEHOLDER ----
    # Replace the line below with your actual higgsfield call
    # higgsfield generate create kling3_0 \
    #   --prompt "$PROMPT" \
    #   --aspect_ratio 9:16 \
    #   --duration 10 \
    #   --start_image "$START" \
    #   --mode std \
    #   --sound off \
    #   --wait \
    #   --json > mobile/dive_${i}.json

    echo "placeholder for mobile_dive_${i}.mp4" > mobile/dive_${i}.mp4
  done

  # ------------------------------------------------------------
  # 5.  Encode all videos
  # ------------------------------------------------------------
  mkdir -p encoded
  for mp4 in videos/*.mp4; do
    ffmpeg -i "$mp4" -c:v libx264 -preset slow -crf 20 -g 8 -pix_fmt yuv420p -an "encoded/${mp4##*/}"
  done
  for mp4 in mobile/*.mp4; do
    ffmpeg -i "$mp4" -c:v libx264 -preset slow -crf 20 -g 4 -pix_fmt yuv420p -an "encoded/${mp4##*/}"
  done

  # ------------------------------------------------------------
  # 6.  Assemble demo page
  # ------------------------------------------------------------
  cp references/scrub-engine.js .
  cat > index.html <<'EOF'
  <!doctype html>
  <html lang="en"><head>
  <meta charset="utf-8"><title>Arch Linux Scroll‑World</title><link rel="stylesheet" href="scrub-engine.css"></head><body>
  <div id="world"></div>
  <script type="module" src="scrub-engine.js"></script>
  <script>
  import { mountScrollWorld } from './scrub-engine.js';
  mountScrollWorld(document.getElementById('world'), {
    brand: { name: 'Arch Linux' },
    sections: [
      { id:'src',    label:'Source Code',    still:'assets/still_0.png', clip:'encoded/dive_0.mp4' },
      { id:'build',  label:'Compilation',    still:'assets/still_1.png', clip:'encoded/dive_1.mp4' },
      { id:'repo',   label:'Repository',     still:'assets/still_2.png', clip:'encoded/dive_2.mp4' },
      { id:'manager',label:'Pacman',         still:'assets/still_3.png', clip:'encoded/dive_3.mp4' },
      { id:'system', label:'Running System',  still:'assets/still_4.png', clip:'encoded/dive_4.mp4' },
      { id:'community',label:'Community & AUR', still:'assets/still_5.png', clip:'encoded/dive_5.mp4' }
    ],
    connectors: [],            // Architecture A – no connectors
    connectorsMobile: []        // Same for mobile
  });
  </script>
  </body></html>