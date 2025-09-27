!/usr/bin/env bash
# git_large_cleanup.sh — find & purge >100MB files from git (tree + history)
# Usage:
#   ./git_large_cleanup.sh list
#   ./git_large_cleanup.sh purge <path> [... more paths]
#   ./git_large_cleanup.sh ignore
#   ./git_large_cleanup.sh wizard   # guided: scan → choose → purge → push hints
set -euo pipefail

THRESHOLD_MB="${THRESHOLD_MB:-100}"

need_repo() {
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
    echo "✖ Not inside a git repo. cd into your project first."; exit 1; }
}

have_cmd(){ command -v "$1" >/dev/null 2>&1; }

suggest_install_filter_repo() {
  echo "✖ git-filter-repo not found."
  if have_cmd rpm-ostree; then
    echo "→ You are on Fedora Silverblue/Kinoite. Install with:"
    echo "   rpm-ostree install git-filter-repo   # (then reboot)"
  elif have_cmd dnf; then
    echo "→ Install with:  sudo dnf install git-filter-repo -y"
  else
    echo "See: https://github.com/newren/git-filter-repo"
  fi
  exit 1
}

ensure_filter_repo() {
  if git filter-repo -h >/dev/null 2>&1; then return; fi
  if have_cmd git-filter-repo; then return; fi
  suggest_install_filter_repo
}

scan_worktree() {
  echo "🗂  Scanning working tree for files > ${THRESHOLD_MB}MB…"
  find . -type f -size +"${THRESHOLD_MB}"M -print0 2>/dev/null \
  | xargs -0 -I{} du -h {} 2>/dev/null | sort -hr || true
}

scan_history() {
  echo "🔎 Scanning history for blobs > ${THRESHOLD_MB}MB (this may take a moment)…"
  # list object ids
  git rev-list --objects --all \
  | awk '{print $1}' \
  | xargs -n1 -I{} sh -c 'sz=$(git cat-file -s {} 2>/dev/null || echo 0); if [ "$sz" -gt 0 ]; then echo "$sz {}"; fi' \
  | awk -v t="$((THRESHOLD_MB*1024*1024))" '$1>t {print $0}' \
  | sort -nr \
  | while read -r size oid; do
      path=$(git rev-list --objects --all | awk -v id="$oid" '$1==id{print substr($0, index($0,$2))}')
      printf "%8.2f MB  %s\n" "$(echo "$size/1048576" | bc -l)" "$path"
    done || true
}

do_list(){ scan_worktree; echo; scan_history; }

do_purge(){
  ensure_filter_repo
  if [ "$#" -lt 1 ]; then echo "Usage: $0 purge <path> [...]"; exit 1; fi
  echo "⚠  Will rewrite history and REMOVE these paths from ALL commits:"
  for p in "$@"; do echo "   • $p"; done
  echo "   Ctrl+C to abort, or press Enter to continue."
  read -r _
  git branch "backup/pre-filter-$(date +%Y%m%d-%H%M)" >/dev/null 2>&1 || true
  args=(); for p in "$@"; do args+=( --path "$p" ); done
  git filter-repo --force --invert-paths "${args[@]}"
  echo "✅ Purge complete."
  echo "Next:  git push --force-with-lease"
}

do_ignore(){
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
  git add .gitignore || true
  git commit -m "chore: add .gitignore for large binaries" || true
  echo "✅ .gitignore updated. Consider 'git push'."
}

do_wizard(){
  need_repo
  do_list
  echo
  read -r -p "Enter path(s) to purge (space-separated) or leave blank to quit: " -a paths
  if [ "${#paths[@]}" -gt 0 ]; then
    do_purge "${paths[@]}"
    echo "👉 Now run: git push --force-with-lease origin main"
  else
    echo "No paths chosen. Exiting."
  fi
}

main(){
  need_repo
  cmd="${1:-wizard}"; shift || true
  case "$cmd" in
    list)   do_list ;;
    purge)  do_purge "$@" ;;
    ignore) do_ignore ;;
    wizard) do_wizard ;;
    *) echo "Usage: $0 [list|purge <path>...|ignore|wizard]"; exit 1 ;;
  esac
}
main "$@"
