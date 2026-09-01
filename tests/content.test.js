const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/content');
const { sign } = require('../netlify/functions/lib/tokens');

const SECRET = 'test-secret';

function withEnv(fn) {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  process.env.WEDDING_TOKEN_SECRET = SECRET;
  return fn().finally(() => { process.env.WEDDING_TOKEN_SECRET = prev; });
}

function validToken() {
  const ts = Date.now();
  return ts + '.' + sign(ts, SECRET);
}

test('rejects requests with no Authorization header', () => withEnv(async () => {
  const res = await handler({ headers: {} });
  assert.equal(res.statusCode, 401);
}));

test('rejects a forged/garbage token', () => withEnv(async () => {
  const res = await handler({ headers: { authorization: 'Bearer nope' } });
  assert.equal(res.statusCode, 401);
}));

test('fails closed when WEDDING_TOKEN_SECRET is not configured', async () => {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  delete process.env.WEDDING_TOKEN_SECRET;
  try {
    const res = await handler({ headers: { authorization: 'Bearer anything' } });
    assert.equal(res.statusCode, 500);
  } finally {
    process.env.WEDDING_TOKEN_SECRET = prev;
  }
});

test('serves the full content payload for a valid token, never cached client-side', () => withEnv(async () => {
  const res = await handler({ headers: { authorization: 'Bearer ' + validToken() } });
  assert.equal(res.statusCode, 200);
  // Regression: "private, max-age=..." previously let a browser's OWN cache replay
  // this exact response to a later request with a different/missing Authorization
  // header (cache keys aren't header-aware without Vary), serving private content
  // on a shared device even after logout. no-store forces every request to really
  // re-hit the server and re-verify the token — see tests/weather.test.js for the
  // same regression, and the live confirmation this was actually exploitable.
  assert.equal(res.headers['Cache-Control'], 'no-store');

  const body = JSON.parse(res.body);
  for (const lang of ['en', 'es', 'pt']) {
    const c = body[lang];
    assert.ok(c, `missing ${lang} content block`);

    // Coordinator contact
    assert.equal(typeof c.coordinatorName, 'string');
    assert.equal(typeof c.coordinatorRole, 'string');
    assert.match(c.coordinatorPhone, /^\+\d+$/, `${lang}: coordinatorPhone should be a plain "+<digits>" string`);

    // Guest book / gift fund
    assert.match(c.guestbookUrl, /^https:\/\//);
    assert.match(c.giftfundUrl, /^https:\/\//);
    assert.equal(typeof c.guestbookNote, 'string');
    assert.equal(typeof c.giftfundNote, 'string');

    // Each day's schedule is a non-empty array of [time, text] pairs
    for (const key of ['fri_c_schedule', 'fri_r_schedule', 'sat_schedule', 'sun_schedule']) {
      const schedule = c[key];
      assert.ok(Array.isArray(schedule) && schedule.length > 0, `${lang}.${key} should be a non-empty array`);
      for (const row of schedule) {
        assert.equal(row.length, 2, `${lang}.${key} rows should be [time, text] pairs`);
        assert.match(row[0], /^\d{2}:\d{2}$/, `${lang}.${key} time "${row[0]}" should look like HH:MM`);
        assert.equal(typeof row[1], 'string');
        assert.ok(row[1].length > 0);
      }
    }

    // Location / transport / dress copy and map embeds exist for every venue
    for (const prefix of ['fri_c', 'fri_r', 'sat', 'sun']) {
      assert.equal(typeof c[prefix + '_loc'], 'string', `${lang}.${prefix}_loc missing`);
      assert.equal(typeof c[prefix + '_transport'], 'string', `${lang}.${prefix}_transport missing`);
      assert.equal(typeof c[prefix + '_dress'], 'string', `${lang}.${prefix}_dress missing`);
      assert.equal(typeof c[prefix + '_venue'], 'string', `${lang}.${prefix}_venue missing`);
      assert.match(c[prefix + '_map'], /^https:\/\/www\.google\.com\/maps\/embed\?pb=/, `${lang}.${prefix}_map should be a Maps embed URL`);
    }
  }
}));
