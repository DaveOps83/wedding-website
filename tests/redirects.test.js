// Regression guard for a critical exposure: netlify.toml sets `publish = "."`,
// so without an explicit block, Netlify would serve this repo's own source
// files (netlify/functions/*.js — containing the entire private CONTENT
// payload and the auth implementation, plus tests/, package.json, AGENTS.md)
// as plain static files, completely bypassing the auth-gated
// /.netlify/functions/* (note the leading dot) invocation path.
//
// This can't fully simulate Netlify's edge routing, but it does assert the
// forced-404 rules are present and correctly shaped in _redirects, so an
// unrelated future edit to this file can't silently drop the protection.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const redirects = fs.readFileSync(path.join(__dirname, '..', '_redirects'), 'utf8');
const lines = redirects.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

function ruleFor(fromPrefix) {
  return lines.find((l) => l.startsWith(fromPrefix + ' '));
}

test('source/tooling paths are force-blocked with a 404, not served as static files', () => {
  for (const from of ['/netlify/*', '/tests/*', '/package.json', '/AGENTS.md']) {
    const rule = ruleFor(from);
    assert.ok(rule, `expected a redirect rule for ${from} in _redirects`);
    assert.match(rule, /404!\s*$/, `${from}'s rule must force (trailing "!") a 404, so it applies even though the file exists on disk — got: "${rule}"`);
  }
});

test('the blocking rules appear before the catch-all SPA rewrite', () => {
  const catchAllIndex = lines.findIndex((l) => l.startsWith('/* '));
  assert.ok(catchAllIndex !== -1, 'expected a catch-all "/* ..." rule');
  for (const from of ['/netlify/*', '/tests/*', '/package.json', '/AGENTS.md']) {
    const ruleIndex = lines.findIndex((l) => l.startsWith(from + ' '));
    assert.ok(ruleIndex < catchAllIndex, `${from}'s block rule should come before the catch-all rewrite`);
  }
});

test('the blocking rules do not accidentally shadow the real Functions invocation path', () => {
  // The real, auth-gated endpoints are under /.netlify/functions/* (leading dot) —
  // a different path than this repo's own netlify/functions/ source directory.
  assert.ok(!redirects.includes('/.netlify/*'), 'must not block the real /.netlify/* Functions invocation path');
});
