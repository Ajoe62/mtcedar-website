#!/usr/bin/env node
/**
 * Turns a fresh copy of this repo into a blank site for a different school.
 *
 *   npx degit Ajoe62/mtcedar-website greenfield
 *   cd greenfield && npm i
 *   node scripts/new-site.mjs --name "Greenfield Academy" --short Greenfield \
 *     --descriptor "International School" --domain www.greenfield.ng \
 *     --email hello@greenfield.ng --phone "0803 111 2222:+2348031112222" \
 *     --city "Lagos" --region "Lagos State"
 *
 * WHAT IT DOES NOT DO is write the new school's prose. It cannot: nobody can
 * generate a paragraph about a school they have never visited. What it does is
 * remove the previous school's, so the next person is filling blanks rather
 * than hunting for sentences about Benin City in a file about Lagos. Leaving
 * plausible-looking inherited copy in place is how a template ships a site
 * claiming the wrong curriculum.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};

const name = flag('name');
if (!name) {
  console.error('\n  --name is required. See the header of this file for the full form.\n');
  process.exit(1);
}

const short = flag('short', name.split(' ')[0]);
const descriptor = flag('descriptor', 'School');
const domain = flag('domain', 'www.example.com');
const email = flag('email', `hello@${domain.replace(/^www\./, '')}`);
const city = flag('city', 'City');
const region = flag('region', 'Region');
const country = flag('country', 'Nigeria');
const [phoneDisplay, phoneDial] = (flag('phone', '0800 000 0000:+2348000000000')).split(':');

/* ---- identity ------------------------------------------------------------ */

const sitePath = 'src/config/site.ts';
let site = await fs.readFile(sitePath, 'utf8');

const set = (key, value, indent = '  ') => {
  const re = new RegExp(`^(${indent}${key}: )'[^']*'`, 'm');
  if (!re.test(site)) throw new Error(`could not find ${key} in ${sitePath}`);
  site = site.replace(re, `$1'${value.replace(/'/g, "\\'")}'`);
};

set('name', name);
set('shortName', short);
set('descriptor', descriptor);
set('domain', domain);
set('email', email);
set('city', city, '    ');
set('region', region, '    ');
set('country', country, '    ');
set('defaultTitle', `${name} - ${city}`);
set('defaultDescription', `TODO: one sentence describing ${name}, for search results and link previews.`);
set('footerBlurb', `TODO: two sentences about ${name}, shown beside the crest in the footer.`);
set('street', 'TODO: street address', '    ');
set('landmark', '', '    ');
set('area', 'TODO: area', '    ');
set('district', '', '    ');
set('short', `TODO: short address, one line`, '    ');
set('mapsQuery', `${name} ${city}`, '    ');
set('officeHours', 'Monday - Friday, 8:00am - 4:00pm');
set('alt', `${name} crest`, '    ');

site = site.replace(
  /phones: \[[\s\S]*?\],/,
  `phones: [{ display: '${phoneDisplay}', dial: '${phoneDial}' }],`,
);
site = site.replace(/copyrightYear: \d{4},/, `copyrightYear: ${new Date().getFullYear()},`);
await fs.writeFile(sitePath, site, 'utf8');

/* ---- content ------------------------------------------------------------- */

// Emptied rather than rewritten. A collection is a list of a school's own
// facts, and inheriting six facilities from a school 300km away is worse than
// inheriting none: an empty grid is obviously unfinished, a wrong one is not.
const collections = ['news', 'programmes', 'facilities', 'values', 'directions'];
let removed = 0;
for (const c of collections) {
  const dir = path.join('src/content', c);
  for (const f of await fs.readdir(dir)) {
    await fs.unlink(path.join(dir, f));
    removed++;
  }
  await fs.writeFile(
    path.join(dir, '.gitkeep'),
    '',
    'utf8',
  );
}

/* ---- role ---------------------------------------------------------------- */

const pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));
pkg.name = short.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-website';
pkg.templateRole = 'client';
await fs.writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n', 'utf8');

console.log(`
  ${name} scaffolded.

    identity     src/config/site.ts        (search for TODO)
    content      src/content/*             ${removed} files from the previous school removed
    role         templateRole: "client"    src/system is now guarded

  Next, in order:

    1. cp <logo> brand/logo.png
       npm run brand:init -- --logo brand/logo.png --preset <preset>
       open brand/preview.html

    2. Fill the TODOs in src/config/site.ts.

    3. Write src/content/{values,facilities,programmes,news,directions}/*.md
       See TEMPLATE.md for each collection's shape.

    4. Set src/config/features.ts and src/config/pages.ts.

    5. npm run check
`);
