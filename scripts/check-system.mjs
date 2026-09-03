#!/usr/bin/env node
/**
 * The rule that makes template fixes reachable.
 *
 * Sites are spun up by copying this repo, so a bug fixed here has to be
 * cherry-picked into the live sites that already exist. That only stays
 * possible while those sites have not rewritten the files the fix lands in.
 *
 * So: a client repo never edits src/system/. Everything a school needs to be
 * itself lives in brand/, src/config/, src/content/ and public/. If a client
 * genuinely needs a change under src/system/, it belongs upstream, in this
 * repo, where every other school gets it too. That is not bureaucracy, it is
 * the difference between eight sites and eight forks.
 *
 * Enabled by "templateRole": "client" in package.json, which scripts/new-site
 * sets. In the template repo itself the role is "template" and editing
 * src/system is the entire job, so the check passes and says so.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const role = pkg.templateRole ?? 'template';

if (role !== 'client') {
  console.log(`\n  templateRole is "${role}": src/system is editable here.\n`);
  process.exit(0);
}

const base = process.env.SYSTEM_GUARD_BASE || 'origin/main';

let changed = [];
try {
  changed = execSync(`git diff --name-only ${base}...HEAD`, { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
} catch {
  console.error(
    `\n  Could not diff against ${base}. Set SYSTEM_GUARD_BASE to a ref that exists.\n`,
  );
  process.exit(1);
}

const offending = changed.filter((f) => f.startsWith('src/system/') && !f.startsWith('src/system/styles/generated/'));

if (offending.length === 0) {
  console.log('\n  No changes under src/system. Template fixes stay cherry-pickable.\n');
  process.exit(0);
}

console.error(`
  This client repo has changed ${offending.length} file(s) under src/system:

${offending.map((f) => `    ${f}`).join('\n')}

  src/system is shared with every other site built from this template, and a
  local edit here is what makes the next upstream fix unmergeable.

  If this is branding, it belongs in brand/ or src/config/.
  If this is content, it belongs in src/content/.
  If it is a genuine improvement, send it upstream and cherry-pick it back.

  (src/system/styles/generated/ is exempt: brand:init writes it per school.)
`);
process.exit(1);
