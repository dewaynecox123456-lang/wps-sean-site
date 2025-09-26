#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export GITHUB_USER="dewaynecox123456-lang"
#   export GITHUB_TOKEN="ghp_xxx"          # only needed for HTTPS or auto-create
#   ./push_to_github.sh wps-sean-site ssh  # or: ./push_to_github.sh wps-sean-site https
#
# Notes:
# - Run inside your project folder (where .git lives).
# - If repo doesn't exist on GitHub, we'll create it (requires GITHUB_TOKEN).
# - Modes: "ssh" (recommended) or "https".
# - Branch forced to "main".

REPO_NAME="${1:-}"
MODE="${2:-ssh}"    # ssh | https

if [[ -z "${REPO_NAME}" ]]; then
  echo "Usage: $0 <repo-name> [ssh|https]"
  exit 1
fi

if [[ ! -d .git ]]; then
  echo "This folder is not a git repo. Initializing..."
  git init
fi

# Confirm username
: "${GITHUB_USER:?Set GITHUB_USER env var to your GitHub handle}"

# Helper: call GitHub API (needs GITHUB_TOKEN)
gh_api() {
  curl -sS -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json" "$@"
}

# Check/create repo on GitHub (if token available)
create_repo_if_missing() {
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "No GITHUB_TOKEN set; skipping repo create check."
    return
  fi

  echo "Checking if repo ${GITHUB_USER}/${REPO_NAME} exists..."
  if gh_api "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}" | grep -q '"full_name":'; then
    echo "Repo exists."
  else
    echo "Creating repo ${REPO_NAME} under ${GITHUB_USER}..."
    gh_api -X POST "https://api.github.com/user/repos" \
      -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"auto_init\":false}" \
      | grep -q '"full_name"' || { echo "Failed to create repo. Check GITHUB_TOKEN scopes (repo)"; exit 1; }
    echo "Repo created."
  fi
}

create_repo_if_missing

# Set remote URL
if [[ "${MODE}" == "ssh" ]]; then
  REMOTE_URL="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
else
  # HTTPS; prefer tokenless remote + credential helper
  REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    # cache creds for 6 hours
    git config --global credential.helper "cache --timeout=21600" || true
  fi
fi

# Configure remote 'origin'
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "${REMOTE_URL}"
else
  git remote add origin "${REMOTE_URL}"
fi

echo "Remote now:"
git remote -v

# Ensure branch is 'main'
git branch -M main

# Ensure at least one commit
if ! git rev-parse HEAD >/dev/null 2>&1; then
  echo "No commits yet; making initial commit..."
  git add -A
  git commit -m "initial commit"
fi

# Push upstream
echo "Pushing to ${REMOTE_URL}..."
git push -u origin main

echo "✅ Done. Repo '${REPO_NAME}' is online at: https://github.com/${GITHUB_USER}/${REPO_NAME}"