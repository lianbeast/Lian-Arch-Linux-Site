#!/usr/bin/env bash
#
# Removes the files the rewrite orphaned.
#
# Nothing here reaches the production bundle. Dead files in the repo are still
# worth removing, because a dead file is how the next person ends up confused
# about which asset is real.
#
# Every target is checked before it goes: the script searches the source tree for
# a reference and skips anything it finds. If it cannot complete that search it
# skips too, rather than deleting on a guess. Safe to run more than once, and
# safe to run once the files are already gone.
#
# Run from anywhere:  bash scripts/cleanup-dead-code.sh

set -euo pipefail
cd "$(dirname "$0")/.."

# Where a real reference would live. The markdown docs are deliberately excluded:
# a file named in prose is not a file the app loads, and including them would
# make this script refuse to clean up anything the docs happen to mention.
SEARCH_PATHS=(src index.html vite.config.js package.json public)

removed=0
kept=0

# remove <path> <what it was>
remove() {
  local path="$1" what="$2"
  local name hits status
  name="$(basename "$path")"

  if [ ! -e "$path" ]; then
    return 0
  fi

  set +e
  hits=$(grep -rlFI --exclude="$name" -- "$name" "${SEARCH_PATHS[@]}" 2>/dev/null)
  status=$?
  set -e

  if [ "$status" -eq 2 ]; then
    echo "  skipping $path - could not search for references"
    kept=$((kept + 1))
    return 0
  fi

  if [ -n "$hits" ]; then
    echo "  keeping  $path - still referenced by: $(echo "$hits" | tr '\n' ' ')"
    kept=$((kept + 1))
    return 0
  fi

  echo "  removing $path - $what"
  rm -rf -- "$path"
  removed=$((removed + 1))
}

echo "Orphaned assets:"
remove "demo.mp4"                             "abandoned generated hero clip, superseded by the live renderer"
remove "public/fonts/SpaceGrotesk-Bold.woff2" "no @font-face declares weight 700 and nothing uses bold"
remove "public/fonts/Agave-Bold-zeroslashed-parenbulged.woff2" "the Agave @font-face for weight 700 is gone; terminal output is all regular"

echo
echo "Done. Removed $removed, kept $kept."

if [ "$kept" -ne 0 ]; then
  echo
  echo "Something still points at a file this script expected to be dead. Check"
  echo "that reference before removing the file by hand."
fi

echo
echo "Next:"
echo "  npm install && npm run lint && npm run build"
