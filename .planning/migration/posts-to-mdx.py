#!/usr/bin/env python3
"""Convert WordPress posts (posts.json) to MDX files with SEO frontmatter.

Output layout:
    content/blog/YYYY/MM/<slug>.mdx

Each MDX file has YAML frontmatter with:
    - title (from post title or Yoast title)
    - description (from Yoast meta description or excerpt)
    - date (ISO 8601)
    - slug
    - year, month (for URL routing)
    - category, tags
    - author
    - featuredImage (local path under /blog-images/YYYY/MM/)
    - featuredImageAlt
    - canonical (original WP URL — for reference only; canonical tag on new site uses new URL)

WordPress content is inline HTML. We keep it as-is (MDX can render HTML)
and rewrite image src paths to point at the locally downloaded copies.
"""
import html
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "content" / "blog"

WP_IMG_PREFIX = "https://kopflogisticsgroup.com/wp-content/uploads/"
NEW_IMG_PREFIX = "/blog-images/"


def rewrite_content_images(html_content: str) -> str:
    """Rewrite WP image URLs to local /blog-images/..."""

    def repl(match: re.Match) -> str:
        url = match.group(1)
        if WP_IMG_PREFIX in url:
            local = url.replace(WP_IMG_PREFIX, NEW_IMG_PREFIX)
            return f'src="{local}"'
        return match.group(0)

    return re.sub(r'src="([^"]+)"', repl, html_content)


def escape_yaml(value: str) -> str:
    """Safely encode a string as a YAML scalar."""
    if value is None:
        return '""'
    # Use double-quoted style; escape backslashes, double quotes, newlines
    s = str(value).replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()
    return f'"{s}"'


def decode_title(raw: str) -> str:
    """WP titles are HTML-entity-encoded; decode for use in frontmatter."""
    return html.unescape(raw or "").strip()


def slugify_filename(slug: str) -> str:
    """Ensure slug is safe as a filename."""
    return re.sub(r"[^A-Za-z0-9_-]", "-", slug)


def main() -> None:
    posts = json.loads((Path(__file__).parent / "posts.json").read_text())
    cats = {c["id"]: c for c in json.loads((Path(__file__).parent / "categories.json").read_text())}
    tags = {t["id"]: t for t in json.loads((Path(__file__).parent / "tags-all.json").read_text())}

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = 0

    for p in posts:
        d = datetime.fromisoformat(p["date"])
        year = d.strftime("%Y")
        month = d.strftime("%m")
        slug = p["slug"]

        # Extract metadata with fallbacks
        title = decode_title(p["title"]["rendered"])
        raw_excerpt = p.get("excerpt", {}).get("rendered", "")
        excerpt_plain = re.sub(r"<[^>]+>", "", raw_excerpt).strip().replace("\u00a0", " ")
        excerpt_plain = re.sub(r"\s*\[…\]\s*$", "...", excerpt_plain)
        excerpt_plain = re.sub(r"\s+", " ", excerpt_plain)

        yoast = p.get("yoast_head_json", {}) or {}
        desc = (
            yoast.get("description")
            or yoast.get("og_description")
            or excerpt_plain[:160]
        )

        meta_title = (
            yoast.get("title")
            or title
        )

        embedded = p.get("_embedded", {})
        media = (embedded.get("wp:featuredmedia") or [{}])[0]
        featured_url = media.get("source_url", "") or ""
        featured_alt = media.get("alt_text", "") or title
        featured_local = ""
        if featured_url and WP_IMG_PREFIX in featured_url:
            featured_local = featured_url.replace(WP_IMG_PREFIX, NEW_IMG_PREFIX)

        post_cats = [cats[c]["slug"] for c in p.get("categories", []) if c in cats]
        post_tags = [tags[t]["slug"] for t in p.get("tags", []) if t in tags]
        category = post_cats[0] if post_cats else "blog"

        author = (embedded.get("author") or [{}])[0].get("name") or "Kopf Logistics Group"

        content_html = p.get("content", {}).get("rendered", "")
        content_html = rewrite_content_images(content_html)

        # Build frontmatter
        fm = [
            "---",
            f"title: {escape_yaml(title)}",
            f"metaTitle: {escape_yaml(meta_title)}",
            f"description: {escape_yaml(desc)}",
            f"date: {escape_yaml(p['date'])}",
            f"slug: {escape_yaml(slug)}",
            f"year: {escape_yaml(year)}",
            f"month: {escape_yaml(month)}",
            f"category: {escape_yaml(category)}",
            f"categories: [{', '.join(escape_yaml(c) for c in post_cats)}]",
            f"tags: [{', '.join(escape_yaml(t) for t in post_tags)}]",
            f"author: {escape_yaml(author)}",
            f"featuredImage: {escape_yaml(featured_local)}",
            f"featuredImageAlt: {escape_yaml(featured_alt)}",
            f"canonical: {escape_yaml(p['link'])}",
            f"wpId: {p['id']}",
            "---",
            "",
        ]

        body = content_html.strip()

        out_path = OUT_DIR / year / month / f"{slugify_filename(slug)}.mdx"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text("\n".join(fm) + body + "\n")
        written += 1

    print(f"Wrote {written} MDX files to {OUT_DIR}")


if __name__ == "__main__":
    main()
