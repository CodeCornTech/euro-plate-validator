/**
 * Thin Node entrypoint for the ONE shared Bash UI toolkit.
 * No duplicated ANSI codes/palette/spinner logic in JS.
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const toolkit = fileURLToPath(new URL('./cc-ui.sh', import.meta.url));

/**
 * Invoke the single shared Bash CLI UI from Node.
 *
 * @param {string} action
 * @param {...(string | number | boolean)} values
 * @returns {void}
 */
export function ui(action, ...values) {
  // npm already printed the top-level header via cc-ui.sh exec.
  if (action === 'header' && process.env.CC_UI_CONTEXT === '1') return;
  const args = [toolkit, action, ...values.map(value => String(value))];
  const result = spawnSync('bash', args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('Shared CLI UI failed: ' + action + ' (exit ' + result.status + ')');
  }
}