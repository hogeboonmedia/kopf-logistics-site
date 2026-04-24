# Marissa's Publishing & Moderation Guide

Everything you need to write blog posts, moderate comments, and manage spam protection on the Kopf Logistics site. No code, no command line.

---

## First-Time Setup (one time, ~5 minutes)

1. **Create a GitHub account** at https://github.com/signup if you don't already have one. Use your work email.
2. **Send your GitHub username to Jason.** He'll add you to the project's allowlist so you can sign in.
3. Once Jason confirms you're added, go to **https://kopflogisticsgroup.com/admin/** and click **"Login with GitHub."** Approve the access request. You're in.

You only do this once. After that, GitHub remembers you and clicking the admin link signs you in automatically.

---

## Writing a New Blog Post

1. Go to **https://kopflogisticsgroup.com/admin/**.
2. Click **"Blog Posts"** in the left sidebar, then **"New Blog Post."**
3. Fill in the fields:

   | Field | What to put |
   |---|---|
   | **Title** | The headline. Keep it under ~70 characters. |
   | **SEO Meta Title** | Leave blank unless you want a different `<title>` tag than the headline. |
   | **Meta Description** | A 50–200 character summary. Shows in Google search results and social shares. |
   | **Publish Date** | Today's date for "publish now." A future date schedules it. |
   | **URL Slug** | Auto-fills from the title (e.g. "freight broker tips" → `freight-broker-tips`). Edit only if you really need to. |
   | **Primary Category** | Pick the best fit. |
   | **All Categories** | Optional — if the post fits multiple, list them here for cross-listing. |
   | **Tags** | Optional — short keywords (e.g. "ELD", "rate-per-mile"). Helps surface related posts. |
   | **Author** | Defaults to your name. |
   | **Featured Image** | Drag & drop. At least 1200×630 pixels for clean Facebook/LinkedIn sharing. |
   | **Featured Image Alt Text** | Describe the image in one sentence (e.g. "Truck driver checking ELD before a route"). Important for accessibility & SEO. |
   | **Canonical URL** | Leave blank unless this post is republished from somewhere else. |
   | **Draft** | Check this if you want to keep working without publishing. |
   | **Post Body** | The article. Use the rich-text editor or switch to "Raw" mode to paste HTML. |

4. Click **"Save"** to keep working, or **"Publish"** when ready.

5. **The site updates in about 60 seconds.** That's normal — give it a minute, then refresh the public site to see your post live.

### Drag-dropping images into the post body

While editing the body, drag any image file directly into the editor. It auto-uploads to the right folder and inserts it at the cursor. You don't need to do anything special.

### Editing an existing post

In the admin, click "Blog Posts," find the one you want, click it, edit, and hit Publish. Same 60-second update cycle.

### Scheduling a post for the future

Set the **Publish Date** to a future date and time, then hit Publish. The post will commit to the repo immediately but won't appear on the public site until that date has passed (the site rebuilds every time someone visits, so it picks up the new post automatically).

---

## Moderating Comments

Readers can leave comments on every blog post. Most legitimate comments publish instantly because **CleanTalk** (the spam filter we already paid for) approves them automatically. A small fraction land in your moderation queue when CleanTalk is uncertain.

### Where to moderate

In the admin sidebar, click **"Moderate Comments"** — or go directly to **https://kopflogisticsgroup.com/admin/moderate/**.

You'll see three tabs:

- **Queue (Pending + Spam)** — comments that need your decision. Pending = CleanTalk wasn't sure; Spam = CleanTalk flagged it. Review both.
- **Approved** — currently live comments. You can un-approve one if needed.
- **All** — full history.

### What to do with each

For every comment in the queue, you'll see the full body, the commenter's name + email + IP + city/country, and CleanTalk's verdict. Then four buttons:

| Button | When to click |
|---|---|
| **Approve** | The comment is real. Publishes immediately on the post. |
| **Mark Spam** | The comment is spam. It stays in the database (so you can un-spam it later if you change your mind) but never shows on the post. |
| **Send to Queue** | You're not sure — leave it pending and come back later. |
| **Delete** | Remove permanently. Use this only if the comment is truly nasty (PII, harassment) and you want zero record. Otherwise prefer "Mark Spam." |

**Rule of thumb:** if in doubt, mark it spam. False positives can be un-spammed; a published spam comment is bad news.

### What if you see a pattern?

If you see the same IP or country posting spam repeatedly, you can block them site-wide:

1. Go to **/admin/inquiries/** — find the row from that bad actor.
2. Click **"Block IP <ip>"** or **"Block <country>"** to add them to the global blocklist.
3. Future submissions from that IP/country are silently dropped — they never reach the comment form or your inbox.

---

## Contact Form Submissions

Every contact form submission shows up at **https://kopflogisticsgroup.com/admin/inquiries/**, including the spam ones we blocked (so you can see what we're catching).

Each row has:

- **When** — date and time
- **Name + Email** — the submitter
- **Body** — first three lines of the message
- **Origin** — city, country, IP
- **Status** — green "Sent" badge if it reached your inbox, red "Blocked" badge if our spam protection caught it
- **Actions** — "Block this IP" / "Block this country" buttons (one click adds to the site-wide blocklist)

The 30-day stat boxes at the top show how much spam is being filtered.

---

## Managing Blocklists

Go to **https://kopflogisticsgroup.com/admin/blocklists/**. Three sections:

- **Countries** — block ISO country codes (PK, CN, IN, RU are pre-blocked). Two-letter codes only.
- **IP Addresses** — block specific IPs. The fastest way is the "Block this IP" button on /admin/inquiries/.
- **Keywords** — block any submission whose body contains a word/phrase. Pre-seeded with viagra, cialis, "seo services", "crypto investment", etc.

Changes take effect within 60 seconds (we cache for performance).

**These blocklists apply to BOTH the contact form AND the comments** — one rule, two protected surfaces.

---

## Troubleshooting

**My post isn't showing up after I clicked Publish**

- Wait 60 seconds and refresh.
- Still nothing? Check the publish date — if it's in the future, the post is scheduled.
- Still nothing? Check if "Draft" is checked. Drafts don't publish.
- If none of those, message Jason — he can check the Vercel deploy log.

**A spam comment got through**

- Open /admin/moderate/, find it, click "Mark Spam." It disappears from the public post.
- If the same person/IP keeps doing it, click "Block this IP" on /admin/inquiries/ for that submitter.
- If a specific phrase keeps coming up, add it to /admin/blocklists/ keywords.

**A real comment got marked spam**

- Open /admin/moderate/, switch to the "Queue" tab, find it, click "Approve." It publishes immediately.

**I forgot my GitHub password**

- Reset it at https://github.com/password_reset. The admin will sign you in again next time you log in.

**The contact form shows a "Spam check failed" error**

- The Cloudflare Turnstile widget didn't load. Most often a stale browser tab. Have them refresh the page.

---

## What changed from WordPress

- **You log in with GitHub instead of WP admin.** Same idea, different door.
- **No plugins to update.** The site doesn't run WordPress, so there's nothing to patch each week.
- **Spam filtering still uses CleanTalk.** Same product, just talking to it directly instead of through the WP plugin.
- **WPForms is replaced** by a custom form that gives you the same submission dashboard, plus IP geo, country/IP/keyword blocking, and a unified history that includes blocked attempts (WPForms only logs accepted ones).
- **Comments go through your moderation queue.** Approved comments appear instantly; uncertain ones wait for you. Same ergonomics as the WP admin Comments page.

Welcome to the new site.
