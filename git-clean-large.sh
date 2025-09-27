#!/usr/bin/env bash
# git-clean-large.sh — find & purge >100MB files from git (working tree + history)
# Usage:
#   ./git-clean-large.sh list                   # show big files (history + working tree)
#   ./git-clean-large.sh purge <path> [...]     # purge specific paths from ALL history
#   ./git-clean-large.sh ignore                 # add common big-binary patterns to .gitignore
#   ./git-clean-large.sh help                   # show help
#
# Notes:
# - Purge uses git-filter-repo (preferred). We’ll try to install on Fedora if missing.
# - After purge, you MUST push with --force-with-lease.

set -euo pipefail

THRESHOLD_MB="${THRESHOLD_MB:-100}"

usage() {
  sed -n '2,30p' "$0"
}

need_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
    echo "✖ Not inside a git repo. cd into your project first."; exit 1; }
}

have_cmd() { command -v "$1" >/dev/null 2>&1; }

install_filter_repo_if_possible() {
  if have_cmd git-filter-repo || have_cmd git && git filter-repo -h >/dev/null 2>&1; then
    return
  fi
  if have_cmd dnf; then
    echo "ℹ Installing git-filter-repo via dnf (Fedora)…"
    sudo dnf -y install git-filter-repo || true
  fi
}

list_big_history() {
  # Lists blobs in history larger than THRESHOLD_MB
  local threshold_bytes=$(( THRESHOLD_MB * 1024 * 1024 ))
  echo "🔎 Scanning history for blobs > ${THRESHOLD_MB}MB (this may take a moment)…"
  git rev-list --objects --all \
  | awk '{print $1}' \
  | xargs -r -n1 -I{} sh -c 'sz=$(git cat-file -s {} 2>/dev/null || echo 0); if [ "$sz" -gt 0 ]; then echo "$sz {}"; fi' \
  | awk -v t="$threshold_bytes" '$1 > t {print $0}' \
  | sort -nr \
  | while read -r size oid; do
      path=$(git rev-list --objects --all | grep "$oid" | awk '{print substr($0, index($0,$2))}')
      printf "%8.2f MB  %s\n" "$(echo "$size / 1048576" | bc -l)" "$path"
    done || true
}

list_big_worktree() {
  echo "🗂  Scanning working tree for files > ${THRESHOLD_MB}MB…"
  find . -type f -size +"${THRESHOLD_MB}"M -printf "%s %p\n" 2>/dev/null \
  | sort -nr \
  | awk '{mb=$1/1048576; $1=""; printf "%8.2f MB %s\n", mb, $0}'
}

purge_paths() {
  install_filter_repo_if_possible
  if ! git filter-repo -h >/dev/null 2>&1; then
    echo "✖ git-filter-repo not available. Install it (Fedora: sudo dnf -y install git-filter-repo)."
    exit 1
  fi

  echo "⚠  About to rewrite history and REMOVE the following paths from ALL commits:"
  for p in "$@"; do echo "   • $p"; done
  echo "   Press Ctrl+C to abort, or Enter to continue."
  read -r _

  # Create a safety branch
  git branch "backup/pre-filter-$(date +%Y%m%d-%H%M)" >/dev/null 2>&1 || true

  # Run filter-repo once with multiple --path entries
  args=()
  for p in "$@"; do args+=( --path "$p" ); done
  git filter-repo --force --invert-paths "${args[@]}"

  echo "✅ Purge complete. Next steps:"
  echo "   1) git push --force-with-lease"
  echo "   2) Ask collaborators to: git fetch --all && git reset --hard origin/main"
}

add_ignore() {
  cat >> .gitignore <<'EOF'
# Big binaries we never want in Git
*.AppImage
*.iso
*.zip
*.7z
*.tar
*.tar.gz
*.tgz
*.mp4
*.mov
*.avi
*.psd
*.xcf
EOF
  git add .gitignore
  git commit -m "chore: add .gitignore for large binaries" || true
  echo "✅ .gitignore updated."
}

main() {
  need_repo
  sub=${1:-help}
  shift || true
  case "$sub" in
    list)
      list_big_worktree
      echo
      list_big_history
      ;;
    purge)
      [ $# -ge 1 ] || { echo "Usage: $0 purge <path> [...]"; exit 1; }
      purge_paths "$@"
      ;;
    ignore)
      add_ignore
      ;;
    help|*)
      usage
      ;;
  esac
}
main "$@"