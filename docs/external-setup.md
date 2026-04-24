# External Setup Checklist

The new CMS + comment + admin features are fully built and deployed, but they need ~6 external accounts/services to be wired up before they go live for Marissa. This is a one-time, ~45 minute setup. Each step has a verification command at the end so you know it worked.

**Before:** Live URL is https://kopf-logistics-site.vercel.app/

---

## 1. GitHub OAuth App  (~5 min)

Lets Marissa log into Sveltia CMS with her GitHub account.

1. Go to https://github.com/settings/developers → click **New OAuth App**.
2. Fill in:
   - **Application name:** Kopf Logistics CMS
   - **Homepage URL:** `https://kopflogisticsgroup.com`
   - **Authorization callback URL:** `https://kopflogisticsgroup.com/api/admin/callback`
3. Click Register, then **Generate a new client secret**.
4. Add both to Vercel:
   ```bash
   cd "Claude Code/Projects/kopf-logistics-site"
   vercel env add GITHUB_OAUTH_CLIENT_ID production
   vercel env add GITHUB_OAUTH_CLIENT_SECRET production
   ```
5. Add the admin allowlist (comma-separated GitHub usernames who can moderate):
   ```bash
   vercel env add ADMIN_GITHUB_LOGINS production
   # Enter: marissa-github-username,jasonhogeboon (or whatever)
   ```
6. Generate a session secret (32+ random characters) and add it:
   ```bash
   openssl rand -base64 48 | tr -d '\n'   # copy output
   vercel env add KOPF_SESSION_SECRET production
   ```

**Verify:** After redeploying (`vercel --prod`), visit `/admin/` → click "Login with GitHub" → should complete OAuth and load the Sveltia editor.

---

## 2. Vercel Postgres (Neon)  (~5 min)

Stores comments, contact submissions, and blocklists.

1. Go to https://vercel.com/dashboard → your project → **Storage** tab → **Create Database** → **Postgres** (Neon-backed).
2. Vercel auto-injects `DATABASE_URL`, `POSTGRES_URL`, etc. into the project. No manual env setup needed.
3. Pull the env vars locally:
   ```bash
   vercel env pull .env.development.local
   ```
4. Run the three migrations:
   ```bash
   psql "$DATABASE_URL" -f lib/db/migrations/001_comments.sql
   psql "$DATABASE_URL" -f lib/db/migrations/002_contact_submissions.sql
   psql "$DATABASE_URL" -f lib/db/migrations/003_blocklists.sql
   ```
   (Migration 003 pre-seeds the blocklists with PK/CN/IN/RU + common spam keywords.)

**Verify:** `psql "$DATABASE_URL" -c "\dt"` should list `comments`, `contact_submissions`, `blocked_countries`, `blocked_ips`, `blocked_keywords`.

---

## 3. Cloudflare Turnstile  (~3 min)

Free CAPTCHA replacement, used by both contact form and comments.

1. https://dash.cloudflare.com/?to=/:account/turnstile → **Add site** → enter `kopflogisticsgroup.com`. Choose "Managed" widget mode.
2. Copy the **Site Key** and **Secret Key**.
3. Add to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production
   vercel env add TURNSTILE_SECRET_KEY production
   ```

**Verify:** Visit `/contact` → Turnstile widget renders below the form. Visit any blog post → comment form shows Turnstile.

---

## 4. Resend  (~10 min, includes DNS waiting)

Sends contact form submissions to recruiter@kopflogisticsgroup.com.

1. Sign up at https://resend.com (free tier: 3K emails/mo, plenty for Kopf).
2. **Domains** tab → Add `kopflogisticsgroup.com`.
3. Resend gives you SPF + DKIM + DMARC TXT records — add them to your DNS provider (currently your registrar; will be Cloudflare after step 6 below).
4. Wait for verification (~1–10 min depending on DNS propagation).
5. Generate an API key, then:
   ```bash
   vercel env add RESEND_API_KEY production
   vercel env add RESEND_FROM_ADDRESS production
   # Value: "Kopf Website <noreply@kopflogisticsgroup.com>"
   ```

**Verify:** Submit the contact form → email arrives at recruiter@kopflogisticsgroup.com within 30s.

---

## 5. CleanTalk Auth Key  (~2 min)

Re-uses the existing CleanTalk subscription via their Cloud API.

1. Log into https://cleantalk.org/my/ → your service → **Setup options** or similar.
2. Copy the **Access key** (the existing one used by the WordPress plugin works).
3. Add to Vercel:
   ```bash
   vercel env add CLEANTALK_AUTH_KEY production
   ```

**Verify:** Submit a comment with a known spam word like "free viagra" → it should silently disappear (status="spam" in DB), not show up on the post.

---

## 6. Cloudflare DNS + WAF  (~15 min, includes DNS waiting)

Provides edge WAF, geo-blocking PK/CN/IN/RU on `/admin/*` and `/api/*`, and DDoS protection.

1. Sign up at https://cloudflare.com (free plan).
2. **Add a site** → enter `kopflogisticsgroup.com`. Cloudflare will scan existing DNS records.
3. At your registrar, change the nameservers to the two Cloudflare nameservers (Cloudflare displays them).
4. Wait for the SSL/HTTPS to activate (5–15 min).
5. In the Cloudflare dashboard:
   - **SSL/TLS → Edge Certificates:** "Always Use HTTPS" ON, "Automatic HTTPS Rewrites" ON.
   - **Security → Settings:** Bot Fight Mode ON, Browser Integrity Check ON, Security Level Medium.
   - **Security → WAF → Custom rules:** create a rule:
     - **Name:** Geo-block admin + API
     - **Expression:** `(http.request.uri.path matches "^/(admin|api/(admin|contact|comments))" and ip.geoip.country in {"PK" "CN" "IN" "RU"})`
     - **Action:** Block
   - **Rules → Page Rules** (optional): exempt `/_next/static/*` and `/blog-images/*` from any aggressive rules.

**Verify:** From a Pakistan VPN exit node, request `/admin/` → Cloudflare 1020 access denied. From the same exit, request `/` → 200 OK (we're only blocking the admin/API surface).

---

## 7. Point Vercel project to the custom domain (~3 min)

Once Cloudflare is in front, point the production deployment to `kopflogisticsgroup.com`:

1. Vercel project → **Settings** → **Domains** → Add `kopflogisticsgroup.com`.
2. Vercel will give you a CNAME record. In Cloudflare DNS, add:
   - **Type:** CNAME
   - **Name:** `@` (or `kopflogisticsgroup.com`)
   - **Target:** `cname.vercel-dns.com`
   - **Proxy:** ON (orange cloud) — this is what enables the WAF + geo-blocking.
3. Add `www` as another CNAME pointing to the apex.

**Verify:** `curl -sI https://kopflogisticsgroup.com/` returns 200 with security headers. `curl -sI https://kopflogisticsgroup.com/blog/` returns 200.

---

## 8. Final cutover  (do these only after 1–7 verify clean)

1. **Tell Marissa:** her GitHub username has been added, she can sign in at `/admin/`. Send her the link to `docs/publishing-guide.md` (or copy it into a Google Doc for her).
2. **Take WordPress offline.** Cancel the hosting. Cancel the WPForms subscription.
3. **Keep CleanTalk** — we're still using it via the Cloud API.
4. **Submit the new sitemap to Google Search Console:** `https://kopflogisticsgroup.com/sitemap.xml`
5. **Monitor for 7 days:** `/admin/inquiries/` should show real submissions, blocked attempts should mostly be from PK/CN/IN/RU + obvious spam keywords. Comments queue should have low volume of pending items.

---

## Deferred environment variables summary

After all 8 steps, these are set on Vercel:

```
GITHUB_OAUTH_CLIENT_ID
GITHUB_OAUTH_CLIENT_SECRET
ADMIN_GITHUB_LOGINS               # e.g. "marissaexample,jasonhogeboon"
KOPF_SESSION_SECRET               # 32+ random chars
DATABASE_URL                      # auto-set by Vercel Postgres
NEXT_PUBLIC_TURNSTILE_SITE_KEY    # public, OK in client bundle
TURNSTILE_SECRET_KEY              # server only
RESEND_API_KEY
RESEND_FROM_ADDRESS               # e.g. "Kopf Website <noreply@kopflogisticsgroup.com>"
CLEANTALK_AUTH_KEY                # from existing CleanTalk subscription
```

---

## Cost summary (after cutover)

| Item | Monthly |
|---|---|
| Vercel Hobby | $0 |
| Vercel Postgres free | $0 |
| GitHub free | $0 |
| Cloudflare free | $0 |
| Cloudflare Turnstile | $0 |
| Resend free | $0 (3K emails/mo) |
| CleanTalk (already paid) | $0 incremental |
| **WordPress hosting (cancel)** | **−$15–40** |
| **WPForms (cancel)** | **−$4–17** |
| **Net change** | **Saves $20–60/mo** |
