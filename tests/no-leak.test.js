// Regression guard for the actual bug report this migration fixed: the
// entire itinerary used to ship in index.html's inline <script>, readable
// via "View Source" by anyone before they ever entered the password. This
// test statically scans the shipped client file and fails if any private
// content string (derived straight from content.js's CONTENT, so it can't
// drift out of sync) reappears in it.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { CONTENT } = require('../netlify/functions/content');

const INDEX_HTML_PATH = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

// Skip strings too short to be a meaningful, unambiguous signal (avoids
// false positives on short coincidental substrings).
const MIN_LEN = 5;

function collectPrivateStrings() {
  const strings = new Set();
  for (const lang of Object.keys(CONTENT)) {
    for (const [key, value] of Object.entries(CONTENT[lang])) {
      if (typeof value === 'string') {
        strings.add(value);
      } else if (Array.isArray(value)) {
        // Either a schedule array ([[time, text], ...]) or a flat list of
        // strings (e.g. sun_notes) — handle both shapes.
        for (const row of value) {
          if (Array.isArray(row)) {
            for (const cell of row) strings.add(String(cell));
          } else {
            strings.add(String(row));
          }
        }
      }
    }
  }
  return [...strings].filter((s) => s.length >= MIN_LEN);
}

test('none of the private content strings appear in the shipped index.html', () => {
  const leaked = [];
  for (const secret of collectPrivateStrings()) {
    if (indexHtml.includes(secret)) leaked.push(secret);
  }
  assert.deepEqual(leaked, [], `Found ${leaked.length} private string(s) leaked into index.html:\n` + leaked.map((s) => '  - ' + JSON.stringify(s.slice(0, 80))).join('\n'));
});

test('the map embed place-ID fragments do not appear in index.html', () => {
  const placeIdFragments = [];
  for (const lang of Object.keys(CONTENT)) {
    for (const [key, value] of Object.entries(CONTENT[lang])) {
      if (key.endsWith('_map') && typeof value === 'string') {
        const match = value.match(/1s([0-9a-fx%A-F:]{10,})/);
        if (match) placeIdFragments.push(match[1]);
      }
    }
  }
  assert.ok(placeIdFragments.length > 0, 'sanity check: expected to find place-ID fragments in CONTENT to test against');
  const leaked = placeIdFragments.filter((f) => indexHtml.includes(f));
  assert.deepEqual(leaked, []);
});

test('the coordinator phone number does not appear in index.html, in any format', () => {
  const digits = CONTENT.en.coordinatorPhone.replace(/\D/g, ''); // e.g. "34666891100"
  assert.ok(!indexHtml.includes(digits), 'raw phone digits found in index.html');
  assert.ok(!indexHtml.includes(CONTENT.en.coordinatorPhone), 'phone number (with +) found in index.html');
});

test('the private data-fetching functions and endpoints are still wired up client-side', () => {
  // We want the *content* gone, not the mechanism that fetches it.
  assert.match(indexHtml, /\/\.netlify\/functions\/content/);
  assert.match(indexHtml, /fetchContent/);
  assert.match(indexHtml, /contentLoaded/);
});
