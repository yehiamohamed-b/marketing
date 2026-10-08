#!/bin/bash
# Organise Strange Branches assets + Pinterest images in ~/Downloads (macOS).
#
#   bash organize-downloads.sh          # PREVIEW: lists what would move, changes nothing
#   bash organize-downloads.sh --go     # actually moves the files
#
# Only MOVES files (never deletes), and never overwrites an existing file (mv -n).

DL="$HOME/Downloads"
DEST="$DL/Strange Branches"
TODAY=$(date +%Y-%m-%d)
GO=0; [ "$1" = "--go" ] && GO=1
[ $GO = 1 ] && echo "MOVING FILES..." || echo "PREVIEW ONLY (run with --go to move)"
echo

moved=0
move() { # move <file> <folder relative to DEST>
  local src="$1" dir="$DEST/$2"
  echo "  $(basename "$src")  ->  Strange Branches/$2"
  if [ $GO = 1 ]; then mkdir -p "$dir" && mv -n "$src" "$dir/"; fi
  moved=$((moved + 1))
}
from_pinterest() { # macOS records the source URL of every download
  mdls -raw -name kMDItemWhereFroms "$1" 2>/dev/null | grep -qiE 'pinterest|pinimg'
}
mod_date() { stat -f %Sm -t %Y-%m-%d "$1" 2>/dev/null || date -r "$1" +%Y-%m-%d; }

shopt -s nullglob nocaseglob
cd "$DL" || exit 1

# 1. the asset pack folder (if you unzipped it here)
for d in "Strange-Branches"; do [ -d "$d" ] && { echo "  $d/  ->  Strange Branches/Asset Pack"; [ $GO = 1 ] && mkdir -p "$DEST" && mv -n "$d" "$DEST/Asset Pack"; moved=$((moved + 1)); }; done

# files from the "new assets" zip, if you unzipped it here
for f in Strange-Branches-new-assets*/*; do
  [ -f "$f" ] || continue
  case "$(basename "$f")" in
    strange-branches-logo-*.png|strange-branches-banner-*.png) move "$f" "04 Branding (logo + banner)" ;;
    strange-branches-*9x16*.png|strange-branches-*16x9-start.png) move "$f" "02 Shorts Start Frames (9x16)" ;;
    strange-branches-*.html) move "$f" "03 Title Screen Pages" ;;
    0[0-7]-*.md) move "$f" "05 Docs & Scripts" ;;
  esac
done

for f in *; do
  [ -f "$f" ] || continue
  case "$f" in
    strange-branches-*-loop.mp4|strange-branches-*-loop.gif) move "$f" "01 Title Loops (16x9)" ;;
    strange-branches-*-strain-*.mp4|strange-branches-*-wrath-*.mp4|strange-branches-*-lunge-*.mp4|strange-branches-*-sequence-*.mp4) move "$f" "09 Shot Clips" ;;
    strange-branches-logo-*.png|strange-branches-banner-*.png) move "$f" "04 Branding (logo + banner)" ;;
    strange-branches-*9x16*.png|strange-branches-*16x9-start.png) move "$f" "02 Shorts Start Frames (9x16)" ;;
    strange-branches-*.html) move "$f" "03 Title Screen Pages" ;;
    Strange-Branches*.zip|strange-branches-files.zip) move "$f" "06 Zips" ;;
    0[0-7]-*.md|EP0*.md|README.md) move "$f" "05 Docs & Scripts" ;;
    *.jpg|*.jpeg|*.png|*.webp|*.gif|*.avif|*.heic)
      if from_pinterest "$f"; then move "$f" "07 Pinterest References/$(mod_date "$f")"
      elif [ "$(mod_date "$f")" = "$TODAY" ]; then move "$f" "08 Images Saved $TODAY"
      fi ;;
  esac
done

echo
echo "$moved item(s) $( [ $GO = 1 ] && echo moved || echo 'would move' )."
[ $GO = 0 ] && echo "Happy with that? Run:  bash organize-downloads.sh --go"
