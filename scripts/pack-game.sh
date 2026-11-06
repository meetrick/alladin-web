#!/bin/sh
set -eu

root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
use_patched=false
if [ "${1:-}" = "--patched" ]; then
  use_patched=true
  shift
fi
source_dir="${1:-$root/alladin}"
output="$root/docs/aladdin.jsdos"

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/bundle/.jsdos"

if [ -f "$source_dir/disk1.dat" ] && [ -f "$source_dir/disk2.dat" ]; then
  # Restore the original DOS executable and data from the installation disks.
  tar -xf "$source_dir/disk1.dat" -C "$work/bundle"
  tar -xf "$source_dir/disk2.dat" -C "$work/bundle"
  if [ "$use_patched" = true ]; then
    cp "$source_dir/aladdin.exe" "$work/bundle/ALADDIN.EXE"
    cp "$source_dir/tarquin.dat" "$work/bundle/TARQUIN.DAT"
  fi
  if [ -f "$source_dir/sound.cfg" ]; then
    cp "$source_dir/sound.cfg" "$work/bundle/SOUND.CFG"
  fi
else
  for file in "$source_dir"/*; do
    [ -f "$file" ] || continue
    case "$(basename "$file" | tr '[:upper:]' '[:lower:]')" in
      crack.com|disk1.dat|disk2.dat|install.bat|lha.exe) continue ;;
    esac
    cp "$file" "$work/bundle/"
  done
fi

if [ ! -f "$work/bundle/aladdin.exe" ] && [ ! -f "$work/bundle/ALADDIN.EXE" ]; then
  printf 'aladdin.exe가 있는 게임 폴더를 지정하세요.\n' >&2
  exit 1
fi

cat > "$work/bundle/.jsdos/dosbox.conf" <<'CONFIG'
[dosbox]
machine=svga_s3
memsize=16

[cpu]
core=auto
cycles=12000

[sblaster]
sbtype=sb16
sbbase=220
irq=5
dma=1
hdma=5

[autoexec]
@echo off
mount c .
c:
aladdin.exe
CONFIG

(cd "$work/bundle" && zip -q -r "$work/aladdin.jsdos" .)
mv "$work/aladdin.jsdos" "$output"
printf '생성 완료 %s\n' "$output"
