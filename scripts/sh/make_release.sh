#!/usr/bin/env bash
# Pytorchia™ Release Helper — GitHub + NPM Edition
# License: MIT

set -Eeuo pipefail

#######################################
# 🔧 CONFIG
#######################################
SCRIPT_NAME="$(basename "$0")"
SCRIPT_VERSION="2.5.0"
SCRIPT_AUTHOR="Federico Girolami"
SCRIPT_TEAM="Pytorchia™ Developers"
SCRIPT_LICENSE="MIT License"
SCRIPT_DESCRIPTION="Create a GitHub Release from package.json version, with guard-checks, optional auto-commit, tests, build, version bump, push + tags, and optional npm publish."
REPO_ROOT_DIR="./"

# Release
VERSION_TAG=""
RELEASE_NOTES=""
RELEASE_NOTES_FILE=""
ASSETS_GLOB=""
TARGET_BRANCH=""
GENERATE_NOTES=false

# Modes
DRY_RUN=false
DEBUG=false
YES_ALL=false
FORCE=false
ALLOW_DIRTY_TAG=false

# Chain options
AUTO_CHAIN=false  # abilita flow automatico su tree sporco
COMMIT_ALL=true   # git add -A per default
COMMIT_FILES=()   # se vuoi selezionare file specifici
COMMIT_MESSAGE="" # messaggio commit, se vuoto verrà chiesto

RUN_TESTS=false
TEST_SCRIPT="test:samples" # es . test o test:samples

RUN_BUILD=false
BUILD_SCRIPT="build"

BUMP_KIND="none" # none | patch | minor | major | prepatch | preminor | premajor | prerelease
BUMP_PREID=""    # es . alpha , beta , rc

PUSH_AFTER=true

NPM_PUBLISH=false
NPM_ACCESS="public" # public | restricted
NPM_TAG=""          # es . next

#######################################
# 🎨 ANSI
#######################################
if [[ -t 1 ]]; then
    BOLD=$'\e[1m'
    DIM=$'\e[2m'
    ITA=$'\e[3m'
    RESET=$'\e[0m'
    RED=$'\e[31m'
    GREEN=$'\e[32m'
    YELLOW=$'\e[33m'
    BLUE=$'\e[34m'
    MAGENTA=$'\e[35m'
    CYAN=$'\e[36m'
else
    BOLD=
    DIM=
    ITA=
    RESET=
    RED=
    GREEN=
    YELLOW=
    BLUE=
    MAGENTA=
    CYAN=
fi
GOLD=$'\e[38;2;193;162;105m'
SOFT=$'\e[38;2;182;155;106m'

#######################################
# 🪵 Logging
#######################################
log() { printf '%s[%s]%s %s\n' "$BLUE" "$1" "$RESET" "$2"; }
info() { printf '%s[i]%s %s\n' "$CYAN" "$RESET" "$1"; }
ok() { printf '%s[✓]%s %s\n' "$GREEN" "$RESET" "$1"; }
warn() { printf '%s[!]%s %s\n' "$YELLOW" "$RESET" "$1"; }
err() { printf '%s[x]%s %s\n' "$RED" "$RESET" "$1" >&2; }
dbg() { [[ "$DEBUG" == true ]] && printf '%s[dbg]%s %s\n' "$MAGENTA" "$RESET" "$1"; }
die() {
    err "$1"
    exit 1
}

run() {
    local -a cmd=("$@")
    if [[ "$DRY_RUN" == true ]]; then
        warn "DRY-RUN → ${cmd[*]}"
    else
        dbg "exec → ${cmd[*]}"
        "${cmd[@]}"
    fi
}

trap 'err "Errore a riga $LINENO . Uscita ." ' ERR

#######################################
# 🧱 Banner
#######################################
banner() {
    cat <<EOF
${GOLD}${BOLD}┌──────────────────────────────────────────────────────────┐${RESET}
${GOLD}${BOLD}│  ${SOFT}Pytorchia™ Release Helper${RESET}${GOLD}${BOLD}                                │${RESET}
${GOLD}${BOLD}└──────────────────────────────────────────────────────────┘${RESET}
${BOLD}$SCRIPT_NAME ${RESET}${ITA}v$SCRIPT_VERSION${RESET}  ${DIM}by $SCRIPT_AUTHOR  ·  $SCRIPT_TEAM${RESET}
${DIM}License:${RESET} $SCRIPT_LICENSE
${DIM}Description:${RESET} $SCRIPT_DESCRIPTION
EOF
}

#######################################
# 📖 Help
#######################################
usage() {
    cat <<EOF
${BOLD}Usage${RESET} : $SCRIPT_NAME [options]

${BOLD}Repo / Release${RESET} :
  -p , --path <dir>           Root repo . Auto-detect se omesso
  -v , --version <tag>        Versione richiesta . Se omesso → package.json
  -n , --notes <text>         Note testo inline
  -F , --notes-file <file>    Note da file ( priorità )
  -a , --assets <glob>        Allegati release , es . "dist/*"
  -b , --branch <name>        Forza branch , es . main
      --generate-notes        Usa GH generate-notes

${BOLD}Flow / Guardie${RESET} :
      --dry-run               Simula tutto
  -y , --yes                  Non chiedere conferme
  -d , --debug                Log verboso
      --force                 Bypassa guardie
      --allow-dirty-tag       Consente tag con tree sporco
      --auto-chain            Se tree sporco , esegui catena commit → test → build → bump → push

${BOLD}Commit / Test / Build${RESET} :
      --commit-files "A B"    File da aggiungere al commit ( disattiva --commit-all )
      --no-commit-all         Non usare git add -A ( default è on )
      --commit-message "msg"  Messaggio commit
      --run-tests             Esegui test ( npm run <script> )
      --test-script <name>    Script test ( default : $TEST_SCRIPT )
      --run-build             Esegui build ( npm run <script> )
      --build-script <name>   Script build ( default : $BUILD_SCRIPT )

${BOLD}Version bump${RESET} :
      --bump <kind>           none | patch | minor | major | prepatch | preminor | premajor | prerelease
      --preid <id>            Pre-id per prerelease , es . alpha , beta , rc

${BOLD}Push / Publish${RESET} :
      --no-push               Non pushare dopo commit / bump
      --npm-publish           Pubblica su npm
      --npm-access <mode>     public | restricted ( default : $NPM_ACCESS )
      --npm-tag <tag>         npm dist-tag , es . next

${BOLD}Varie${RESET} :
  -V , --version-script       Stampa versione script
  -h , --help                 Aiuto

${BOLD}Esempio${RESET} :
  $SCRIPT_NAME --auto-chain --run-tests --run-build --bump patch --npm-publish --yes
EOF
}

#######################################
# 🧮 Arg parsing
#######################################
parse_args() {
    while (($#)); do
        case "$1" in
        -h | --help)
            usage
            exit 0
            ;;
        -V | --version-script)
            echo "$SCRIPT_VERSION"
            exit 0
            ;;
        -p | --path)
            REPO_ROOT_DIR="${2:?}"
            shift 2
            ;;
        -v | --version)
            VERSION_TAG="${2:?}"
            shift 2
            ;;
        -n | --notes)
            RELEASE_NOTES="${2:?}"
            shift 2
            ;;
        -F | --notes-file)
            RELEASE_NOTES_FILE="${2:?}"
            shift 2
            ;;
        -a | --assets)
            ASSETS_GLOB="${2:?}"
            shift 2
            ;;
        -b | --branch)
            TARGET_BRANCH="${2:?}"
            shift 2
            ;;
        --generate-notes)
            GENERATE_NOTES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -y | --yes)
            YES_ALL=true
            shift
            ;;
        -d | --debug)
            DEBUG=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --allow-dirty-tag)
            ALLOW_DIRTY_TAG=true
            shift
            ;;
        --auto-chain)
            AUTO_CHAIN=true
            shift
            ;;

        --commit-files)
            IFS=' ' read -r -a COMMIT_FILES <<<"${2:?}"
            COMMIT_ALL=false
            shift 2
            ;;
        --no-commit-all)
            COMMIT_ALL=false
            shift
            ;;
        --commit-message)
            COMMIT_MESSAGE="${2:?}"
            shift 2
            ;;

        --run-tests)
            RUN_TESTS=true
            shift
            ;;
        --test-script)
            TEST_SCRIPT="${2:?}"
            shift 2
            ;;
        --run-build)
            RUN_BUILD=true
            shift
            ;;
        --build-script)
            BUILD_SCRIPT="${2:?}"
            shift 2
            ;;

        --bump)
            BUMP_KIND="${2:?}"
            shift 2
            ;;
        --preid)
            BUMP_PREID="${2:?}"
            shift 2
            ;;

        --no-push)
            PUSH_AFTER=false
            shift
            ;;
        --npm-publish)
            NPM_PUBLISH=true
            shift
            ;;
        --npm-access)
            NPM_ACCESS="${2:?}"
            shift 2
            ;;
        --npm-tag)
            NPM_TAG="${2:?}"
            shift 2
            ;;

        --)
            shift
            break
            ;;
        *) die "Argomento sconosciuto : $1" ;;
        esac
    done
}

#######################################
# 🧪 Guard-checks
#######################################
require_bin() { command -v "$1" >/dev/null 2>&1 || die "Manca dipendenza : $1"; }

find_git_root() {
    local here
    here="$(pwd)"
    if git -C "$here" rev-parse --show-toplevel >/dev/null 2>&1; then
        git -C "$here" rev-parse --show-toplevel
        return
    fi
    local dir
    dir="$(dirname "$(realpath "$0")")"
    while [[ "$dir" != "/" ]]; do
        [[ -d "$dir/.git" ]] && {
            echo "$dir"
            return
        }
        dir="$(dirname "$dir")"
    done
    echo ""
}

assert_repo() {
    [[ -d "$REPO_ROOT_DIR/.git" ]] || die "Non sembra una repo git : $REPO_ROOT_DIR"
    info "Repo root = ${BOLD}$REPO_ROOT_DIR${RESET}"
}

assert_branch() {
    [[ -z "$TARGET_BRANCH" ]] && return 0
    local cur
    cur="$(git -C "$REPO_ROOT_DIR" rev-parse --abbrev-ref HEAD)"
    if [[ "$cur" != "$TARGET_BRANCH" && "$FORCE" != true ]]; then
        die "Branch corrente '$cur' diverso da richiesto '$TARGET_BRANCH' . Usa --force per bypassare ."
    fi
}

is_dirty() {
    git -C "$REPO_ROOT_DIR" update-index -q --refresh
    ! git -C "$REPO_ROOT_DIR" diff-index --quiet HEAD --
}

confirm() {
    [[ "$YES_ALL" == true ]] && return 0
    read -r -p "$1 [y/N] " ans
    [[ "${ans,,}" == "y" || "${ans,,}" == "yes" ]]
}

get_pkg_version() {
    (cd "$REPO_ROOT_DIR" && node -p "require('./package.json').version" 2>/dev/null) \
        || die "Impossibile leggere version da package.json"
}

is_semver() {
    [[ "$1" =~ ^[0-9]+(\.[0-9]+){2}(-[0-9A-Za-z\.-]+)?(\+[0-9A-Za-z\.-]+)?$ ]]
}

read_notes() {
    if [[ -n "$RELEASE_NOTES_FILE" ]]; then
        [[ -f "$RELEASE_NOTES_FILE" ]] || die "File note non trovato : $RELEASE_NOTES_FILE"
        RELEASE_NOTES="$(cat "$RELEASE_NOTES_FILE")"
    fi
}

resolve_version() {
    if [[ -z "$VERSION_TAG" ]]; then
        VERSION_TAG="$(get_pkg_version)"
        info "Versione da package.json → ${BOLD}$VERSION_TAG${RESET}"
    else
        info "Versione richiesta → ${BOLD}$VERSION_TAG${RESET}"
    fi
    is_semver "$VERSION_TAG" || die "Versione non in formato semver : $VERSION_TAG"
}

detect_prerelease_flag() {
    [[ "$VERSION_TAG" == *"-"* ]] && echo "--prerelease" || echo ""
}

tag_exists() {
    git -C "$REPO_ROOT_DIR" show-ref --tags --verify --quiet "refs/tags/v$VERSION_TAG"
}

ensure_tag() {
    if tag_exists; then
        ok "Tag v$VERSION_TAG già esistente"
    else
        if confirm "Creare tag v$VERSION_TAG ?"; then
            run git -C "$REPO_ROOT_DIR" tag -a "v$VERSION_TAG" -m "Release v$VERSION_TAG"
            run git -C "$REPO_ROOT_DIR" push origin "v$VERSION_TAG"
            ok "Tag v$VERSION_TAG creato e pushato"
        else
            die "Tag necessario non creato"
        fi
    fi
}

#######################################
# 🔗 Catena su tree sporco
#######################################
auto_chain_if_needed() {
    if ! is_dirty; then
        ok "Working tree pulito"
        return 0
    fi

    if [[ "$ALLOW_DIRTY_TAG" == true ]]; then
        warn "Working tree sporco , ma consentito da --allow-dirty-tag"
        return 0
    fi

    if [[ "$AUTO_CHAIN" != true ]]; then
        die "Working tree sporco . Committa o usa --allow-dirty-tag / --force . ( oppure passa --auto-chain )"
    fi

    info "Avvio catena automatica su working tree sporco …"

    # 1 . Commit
    if [[ -z "$COMMIT_MESSAGE" ]]; then
        if [[ "$YES_ALL" == true ]]; then
            COMMIT_MESSAGE="chore: prepare release"
        else
            read -r -p "📝 Messaggio commit : " COMMIT_MESSAGE
            [[ -z "$COMMIT_MESSAGE" ]] && COMMIT_MESSAGE="chore: prepare release"
        fi
    fi

    if [[ "$COMMIT_ALL" == true ]]; then
        run git -C "$REPO_ROOT_DIR" add -A
    elif ((${#COMMIT_FILES[@]})); then
        run git -C "$REPO_ROOT_DIR" add "${COMMIT_FILES[@]}"
    else
        run git -C "$REPO_ROOT_DIR" add -A
    fi

    run git -C "$REPO_ROOT_DIR" commit -m "$COMMIT_MESSAGE" || warn "Nessuna modifica da committare"

    # 2 . Tests
    if [[ "$RUN_TESTS" == true ]]; then
        info "Eseguo test : npm run $TEST_SCRIPT"
        run bash -lc "cd \"$REPO_ROOT_DIR\" && npm run \"$TEST_SCRIPT\""
    fi

    # 3 . Build
    if [[ "$RUN_BUILD" == true ]]; then
        info "Eseguo build : npm run $BUILD_SCRIPT"
        run bash -lc "cd \"$REPO_ROOT_DIR\" && npm run \"$BUILD_SCRIPT\""
    fi

    # 4 . Bump
    if [[ "$BUMP_KIND" != "none" ]]; then
        local -a bump_cmd=(npm version "$BUMP_KIND")
        [[ -n "$BUMP_PREID" ]] && bump_cmd+=(--preid "$BUMP_PREID")
        bump_cmd+=(-m "chore(release): v%s — $COMMIT_MESSAGE")
        info "Bump versione : ${bump_cmd[*]}"
        run bash -lc "cd \"$REPO_ROOT_DIR\" && ${bump_cmd[*]}"

        # aggiorna VERSION_TAG dalla nuova package.json
        VERSION_TAG="$(get_pkg_version)"
        ok "Nuova versione : v$VERSION_TAG"
    else
        info "Bump versione disattivato"
    fi

    # 5 . Push
    if [[ "$PUSH_AFTER" == true ]]; then
        run git -C "$REPO_ROOT_DIR" push
        run git -C "$REPO_ROOT_DIR" push --tags || true
    fi
}

#######################################
# 🚀 Release
#######################################
do_release() {
    banner
    require_bin git
    require_bin gh
    require_bin node
    require_bin npm

    REPO_ROOT_DIR="${REPO_ROOT_DIR:-$(find_git_root)}"
    [[ -z "$REPO_ROOT_DIR" ]] && die "Non è stata trovata una repo Git valida"
    assert_repo
    cd "$REPO_ROOT_DIR"

    assert_branch
    # Se serve , esegue commit → test → build → bump → push
    auto_chain_if_needed

    # Se non abbiamo bumpato , risolvi la versione attuale
    [[ -z "$VERSION_TAG" ]] && resolve_version

    read_notes
    local preflag
    preflag="$(detect_prerelease_flag)"

    # Tag GH : se npm version ha già creato il tag , lo vedremo esistente
    ensure_tag

    # Assets
    local -a assets_arg=()
    if [[ -n "$ASSETS_GLOB" ]]; then
        shopt -s nullglob
        mapfile -t files < <(cd "$REPO_ROOT_DIR" && compgen -G "$ASSETS_GLOB" || true)
        shopt -u nullglob
        if ((${#files[@]})); then
            for f in "${files[@]}"; do assets_arg+=(--attach "$f"); done
            info "Allegati : ${files[*]}"
        else
            warn "Nessun file combacia con glob : $ASSETS_GLOB"
        fi
    fi

    # Note
    local -a notes_arg=()
    if [[ -n "$RELEASE_NOTES" ]]; then
        notes_arg=(--notes "$RELEASE_NOTES")
    elif [[ "$GENERATE_NOTES" == true ]]; then
        notes_arg=(--generate-notes)
    fi

    local -a cmd=(gh release create "v$VERSION_TAG" --title "v$VERSION_TAG")
    [[ -n "$preflag" ]] && cmd+=("$preflag")
    cmd+=("${notes_arg[@]}" "${assets_arg[@]}")

    if [[ "$DRY_RUN" == true ]]; then
        warn "DRY-RUN : salto creazione release"
        log "cmd" " ${cmd[*]} "
    else
        info "Creo la release su GitHub …"
        run "${cmd[@]}"
        ok "Release v$VERSION_TAG pubblicata"
    fi

    # NPM publish opzionale
    if [[ "$NPM_PUBLISH" == true ]]; then
        local -a pub=(npm publish --access "$NPM_ACCESS")
        [[ -n "$NPM_TAG" ]] && pub+=(--tag "$NPM_TAG")
        info "Pubblico su npm : ${pub[*]}"
        run bash -lc "cd \"$REPO_ROOT_DIR\" && ${pub[*]}"
        ok "npm publish completato"
    fi
}

#######################################
# 🏁 Bootstrap
#######################################
main() {
    parse_args "$@"
    do_release
}

main "$@"
