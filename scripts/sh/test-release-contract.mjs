import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ui } from '../lib/cc-ui-node.mjs';

const shell = readFileSync(new URL('./make_release.sh', import.meta.url), 'utf8');
assert.doesNotMatch(shell, /assets_arg\+=\(--attach/, 'gh release create has no --attach');
assert.match(shell, /assets_arg\+=\("\$f"\)/, 'asset paths are positional arguments');
assert.match(shell, /cmd=\(gh release create "v\$VERSION_TAG" "\$\{assets_arg\[@\]\}"/);
assert.match(shell, /cmd\+=\(--latest\)/, 'stable releases explicitly set Latest');
assert.match(shell, /--latest=false/, 'prereleases cannot replace stable Latest');
assert.match(shell, /gh api repos\/:owner\/:repo\/releases\/latest/);
assert.match(shell, /die "Nessun file combacia/, 'invalid asset globs fail rather than silently omit');
ui('ok', 'Release contract: assets, Latest and explicit failure verified');
