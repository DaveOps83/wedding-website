// Proxies a 3-day daily forecast for Málaga (ceremony/reception/drinks) and
// Torremolinos (beach day) from Open-Meteo (free, no API key). Kept server-side
// so the CSP's connect-src stays locked to 'self' and results can be cached
// briefly to avoid hammering the upstream API on every page load.

let cache = { data: null, expires: 0 };

exports.handler = async () => {
  const now = Date.now();
  if (cache.data && now < cache.expires) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
      body: JSON.stringify(cache.data)
    };
  }

  try {
    // index 0: Málaga (Iglesia de San Juan / Hacienda Nadales / Trocadero)
    // index 1: Torremolinos (La Playa Surf House)
    const url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=36.7213,36.6203' +
      '&longitude=-4.4214,-4.4998' +
      '&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max' +
      '&timezone=Europe%2FMadrid' +
      '&start_date=2026-09-11&end_date=2026-09-13';

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Upstream weather API returned ' + res.status);
    }
    const raw = await res.json();

    const toDaily = (loc) => {
      const out = {};
      loc.daily.time.forEach((date, i) => {
        out[date] = {
          max: Math.round(loc.daily.temperature_2m_max[i]),
          min: Math.round(loc.daily.temperature_2m_min[i]),
          code: loc.daily.weathercode[i],
          rain: loc.daily.precipitation_probability_max[i]
        };
      });
      return out;
    };

    const data = {
      malaga: toDaily(raw[0]),
      torremolinos: toDaily(raw[1]),
      fetchedAt: new Date().toISOString()
    };

    cache = { data, expires: now + 30 * 60 * 1000 }; // 30 min

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error('Weather fetch failed:', err.message);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Weather unavailable' })
    };
  }
};
