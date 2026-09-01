const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { sign } = require('../netlify/functions/lib/tokens');

const SECRET = 'test-secret';
const WEATHER_PATH = require.resolve('../netlify/functions/weather');

// weather.js keeps module-level cache/inflight state, which is exactly what
// we want to exercise (that's the whole point of the race-condition fix) —
// but tests need a *fresh* instance each time so one test's cache doesn't
// leak into the next. Clearing the require cache gives each test its own
// module-level `cache`/`inflight` state, matching a cold Lambda container.
function freshHandler() {
  delete require.cache[WEATHER_PATH];
  return require('../netlify/functions/weather').handler;
}

function bearer(token) { return { headers: { authorization: 'Bearer ' + token } }; }

function mockFetch(impl) {
  const prev = global.fetch;
  const calls = [];
  global.fetch = async (...args) => { calls.push(args); return impl(...args); };
  return { calls, restore: () => { global.fetch = prev; } };
}

const OPEN_METEO_OK_BODY = [
  { daily: { time: ['2026-09-11'], temperature_2m_max: [28], temperature_2m_min: [20], weathercode: [0], precipitation_probability_max: [5] } },
  { daily: { time: ['2026-09-13'], temperature_2m_max: [27], temperature_2m_min: [21], weathercode: [1], precipitation_probability_max: [10] } }
];

function withEnv(fn) {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  process.env.WEDDING_TOKEN_SECRET = SECRET;
  return fn().finally(() => { process.env.WEDDING_TOKEN_SECRET = prev; });
}

function validToken() {
  const ts = Date.now();
  return ts + '.' + sign(ts, SECRET);
}

test('rejects requests with no Authorization header, without touching the network', () => withEnv(async () => {
  const fetchMock = mockFetch(async () => { throw new Error('should not be called'); });
  try {
    const handler = freshHandler();
    const res = await handler({ headers: {} });
    assert.equal(res.statusCode, 401);
    assert.equal(fetchMock.calls.length, 0);
  } finally {
    fetchMock.restore();
  }
}));

test('rejects a forged token', () => withEnv(async () => {
  const handler = freshHandler();
  const res = await handler(bearer('garbage.token'));
  assert.equal(res.statusCode, 401);
}));

test('serves forecast data for a valid token, never cached client-side', () => withEnv(async () => {
  const fetchMock = mockFetch(async () => ({ ok: true, json: async () => OPEN_METEO_OK_BODY }));
  try {
    const handler = freshHandler();
    const res = await handler(bearer(validToken()));
    const body = JSON.parse(res.body);
    assert.equal(res.statusCode, 200);
    assert.equal(body.malaga['2026-09-11'].max, 28);
    assert.equal(body.torremolinos['2026-09-13'].min, 21);
    // Regression: "private, max-age=..." previously let a browser's OWN cache replay
    // this exact response to a later request with a different/missing Authorization
    // header (cache keys aren't header-aware without Vary) — confirmed live: a
    // tampered signature, a forged future timestamp, and no token at all were all
    // served a stale cached 200 until the fetch bypassed cache. no-store forces
    // every request to really re-hit the server and re-verify the token.
    assert.equal(res.headers['Cache-Control'], 'no-store');
  } finally {
    fetchMock.restore();
  }
}));

test('returns 502 without crashing when the upstream API fails', () => withEnv(async () => {
  const fetchMock = mockFetch(async () => ({ ok: false, status: 500 }));
  try {
    const handler = freshHandler();
    const res = await handler(bearer(validToken()));
    assert.equal(res.statusCode, 502);
  } finally {
    fetchMock.restore();
  }
}));

test('fails closed when WEDDING_TOKEN_SECRET is not configured', async () => {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  delete process.env.WEDDING_TOKEN_SECRET;
  try {
    const handler = freshHandler();
    const res = await handler(bearer('anything'));
    assert.equal(res.statusCode, 500);
  } finally {
    process.env.WEDDING_TOKEN_SECRET = prev;
  }
});

test('regression: concurrent requests on a cold cache share a single upstream fetch', () => withEnv(async () => {
  let resolveUpstream;
  const upstreamGate = new Promise((resolve) => { resolveUpstream = resolve; });
  const fetchMock = mockFetch(async () => {
    await upstreamGate; // hold every concurrent call open until we release it below
    return { ok: true, json: async () => OPEN_METEO_OK_BODY };
  });
  try {
    const handler = freshHandler();
    const token = validToken();

    // Fire 5 concurrent requests against a definitely-cold cache.
    const inFlight = Promise.all([
      handler(bearer(token)), handler(bearer(token)), handler(bearer(token)),
      handler(bearer(token)), handler(bearer(token))
    ]);
    resolveUpstream();
    const results = await inFlight;

    assert.equal(results.every((r) => r.statusCode === 200), true);
    assert.equal(fetchMock.calls.length, 1, 'expected exactly one upstream call for 5 concurrent cold-cache requests');

    // A further request should now be served from the warm cache — still no new upstream call.
    const cached = await handler(bearer(token));
    assert.equal(cached.statusCode, 200);
    assert.equal(fetchMock.calls.length, 1, 'expected the cache to serve the next request, not a new upstream call');
  } finally {
    fetchMock.restore();
  }
}));
