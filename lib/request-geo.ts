/**
 * Read client IP + geolocation from a request running on Vercel.
 *
 * Vercel injects `x-vercel-ip-*` headers on every edge request:
 *   - x-vercel-ip-country         (ISO 3166-1 alpha-2, e.g. "US")
 *   - x-vercel-ip-country-region  ("CA", "TX", etc.)
 *   - x-vercel-ip-city            (URL-encoded, e.g. "San%20Francisco")
 *   - x-vercel-ip-latitude
 *   - x-vercel-ip-longitude
 *
 * For IP, use `x-forwarded-for` (first entry = client; rest = proxies).
 */

export interface RequestGeo {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  userAgent: string | null;
}

export function readGeo(headers: Headers): RequestGeo {
  const xff = headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0].trim() : headers.get("x-real-ip");

  const cityRaw = headers.get("x-vercel-ip-city");
  let city: string | null = null;
  if (cityRaw) {
    try {
      city = decodeURIComponent(cityRaw);
    } catch {
      city = cityRaw;
    }
  }

  return {
    ip: ip || null,
    country: headers.get("x-vercel-ip-country"),
    region: headers.get("x-vercel-ip-country-region"),
    city,
    latitude: headers.get("x-vercel-ip-latitude"),
    longitude: headers.get("x-vercel-ip-longitude"),
    userAgent: headers.get("user-agent"),
  };
}
