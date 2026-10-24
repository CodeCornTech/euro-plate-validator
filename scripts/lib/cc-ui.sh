#!/usr/bin/env bash
# EURO PLATE VALIDATOR · single source of truth for CLI appearance.
# Source from shell scripts, or invoke as CLI adapter from Node/PHP/npm.
# Compatible with macOS Bash 3.2, Linux and GitHub Actions.
# Define the toolkit once when sourced. Direct CLI calls always initialize it.
# No top-level return/exit: ShellCheck and direct invocation both stay valid.
if [[ "${BASH_SOURCE[0]}" == "$0" || "${CC_UI_LOADED:-0}" != 1 ]]; then
  CC_UI_LOADED=1

  CC_UI_RESET='' CC_UI_BOLD='' CC_UI_DIM=''
  CC_UI_CYAN='' CC_UI_BLUE='' CC_UI_GREEN='' CC_UI_YELLOW='' CC_UI_RED=''
  if [[ -t 1 && -z "${NO_COLOR:-}" && "${CLICOLOR:-1}" != 0 && "${TERM:-dumb}" != dumb ]]; then
    CC_UI_RESET=$'\033[0m'
    CC_UI_BOLD=$'\033[1m'
    CC_UI_DIM=$'\033[2m'
    CC_UI_CYAN=$'\033[36m'
    CC_UI_BLUE=$'\033[34m'
    CC_UI_GREEN=$'\033[32m'
    CC_UI_YELLOW=$'\033[33m'
    CC_UI_RED=$'\033[31m'
  fi

  cc_ui_line() {
    local color="$1" symbol="$2"
    shift 2
    printf '%s%s%s %s\n' "$color" "$symbol" "$CC_UI_RESET" "$*"
  }
  cc_ui_header() { printf '\n%s%s%s\n' "$CC_UI_BOLD$CC_UI_CYAN" "$*" "$CC_UI_RESET"; }
  cc_ui_section() { printf '\n%s%s%s\n' "$CC_UI_BLUE" "── $* ──" "$CC_UI_RESET"; }
  cc_ui_info() { cc_ui_line "$CC_UI_BLUE" '›' "$@"; }
  cc_ui_step() { cc_ui_line "$CC_UI_CYAN" '→' "$@"; }
  cc_ui_ok() { cc_ui_line "$CC_UI_GREEN" '✓' "$@"; }
  cc_ui_warn() { cc_ui_line "$CC_UI_YELLOW" '!' "$@" >&2; }
  cc_ui_error() { cc_ui_line "$CC_UI_RED" '✗' "$@" >&2; }
  cc_ui_debug() { [[ "${CC_UI_DEBUG:-0}" == 1 ]] && cc_ui_line "$CC_UI_DIM" '·' "$@" >&2 || :; }
  cc_ui_kv() { printf '%s%-16s%s %s\n' "$CC_UI_DIM" "$1" "$CC_UI_RESET" "$2"; }

  # Bounded determinate bar, plain text when redirected / in CI.
  cc_ui_progress() {
    local current="$1" total="$2" label="${3:-}" width=24 percent filled empty bar
    if ! [[ "$current" =~ ^[0-9]+$ && "$total" =~ ^[1-9][0-9]*$ ]]; then
      cc_ui_error 'progress requires nonnegative integer current and positive total'
      return 2
    fi
    ((current > total)) && current="$total"
    percent=$((100 * current / total))
    filled=$((width * current / total))
    empty=$((width - filled))
    printf -v bar '%*s' "$filled" ''
    bar="${bar// /#}"
    printf -v empty '%*s' "$empty" ''
    empty="${empty// /-}"
    printf '%s[%s%s]%s %3d%%  %s\n' "$CC_UI_CYAN" "$bar" "$empty" "$CC_UI_RESET" "$percent" "$label"
  }

  # Spinner appears only for interactive commands run through this helper.
  # No spinner/log suppression in CI and pipelines. Never use for interactive apps.
  cc_ui_run() {
    local label="${1:?label required}"
    shift
    [[ "${1:-}" == -- ]] && shift
    (($# > 0)) || {
      cc_ui_error 'run requires command'
      return 2
    }
    if [[ ! -t 1 || "${CI:-}" == true || "${CC_UI_SPINNER:-1}" == 0 || "${TERM:-dumb}" == dumb ]]; then
      cc_ui_step "$label"
      local rc
      if "$@"; then rc=0; else rc=$?; fi
      if ((rc == 0)); then cc_ui_ok "$label"; else cc_ui_error "$label (exit $rc)"; fi
      return "$rc"
    fi
    local tmp pid rc idx=0 frame
    tmp="$(mktemp "${TMPDIR:-/tmp}/cc-ui.XXXXXX")" || return 1
    "$@" >"$tmp" 2>&1 &
    pid=$!
    while kill -0 "$pid" 2>/dev/null; do
      case $((idx % 4)) in
      0) frame='|' ;; 1) frame='/' ;; 2) frame='-' ;; 3) frame='╲' ;;
      esac
      printf '\r\033[2K%s%s%s %s' "$CC_UI_CYAN" "$frame" "$CC_UI_RESET" "$label"
      idx=$((idx + 1))
      sleep 0.12
    done
    wait "$pid" && rc=0 || rc=$?
    printf '\r\033[2K'
    if ((rc == 0)); then
      cc_ui_ok "$label"
      if [[ "${CC_UI_VERBOSE:-0}" == 1 ]]; then cat "$tmp"; fi
    else
      cc_ui_error "$label (exit $rc)"
      cat "$tmp" >&2
    fi
    rm -f "$tmp"
    return "$rc"
  }

  # Preserve live output, input, exit code and signals for releases/deploy/dev.
  cc_ui_exec() {
    local label="${1:?label required}"
    shift
    [[ "${1:-}" == -- ]] && shift
    (($# > 0)) || {
      cc_ui_error 'exec requires command'
      return 2
    }
    # One top-level heading/result even if npm scripts invoke other scripts.
    if [[ "${CC_UI_CONTEXT:-0}" == 1 ]]; then
      "$@"
      return $?
    fi
    cc_ui_header "${CC_UI_BRAND:-EURO PLATE VALIDATOR} · $label"
    export CC_UI_CONTEXT=1
    local rc
    if "$@"; then rc=0; else rc=$?; fi
    if ((rc == 0)); then cc_ui_ok "$label"; else cc_ui_error "$label (exit $rc)"; fi
    return "$rc"
  }

fi # end shared-toolkit initialization guard

# CLI entrypoint to share the *same* UI with npm/Node/PHP callers.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  action="${1:-help}"
  [[ $# -gt 0 ]] && shift
  case "$action" in
  header) cc_ui_header "$@" ;; section) cc_ui_section "$@" ;;
  info) cc_ui_info "$@" ;; step) cc_ui_step "$@" ;;
  ok | success) cc_ui_ok "$@" ;; warn) cc_ui_warn "$@" ;;
  error) cc_ui_error "$@" ;; debug) cc_ui_debug "$@" ;;
  kv) cc_ui_kv "$@" ;; progress) cc_ui_progress "$@" ;;
  run) cc_ui_run "$@" ;; exec) cc_ui_exec "$@" ;;
  help | -h | --help)
    printf 'Usage: bash scripts/lib/cc-ui.sh {header|section|info|step|ok|warn|error|kv|progress|run|exec} [args...]\n'
    ;;
  *)
    cc_ui_error "Unknown action: $action"
    exit 2
    ;;
  esac
fi