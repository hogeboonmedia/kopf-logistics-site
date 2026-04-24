#!/usr/bin/env python3
"""Fetch all WordPress posts from kopflogisticsgroup.com via REST API."""
import json
import urllib.request
import urllib.parse
import sys
import time
from pathlib import Path

BASE = "https://kopflogisticsgroup.com/wp-json/wp/v2"
UA = "Mozilla/5.0"
OUT = Path(__file__).parent


def fetch(url: str) -> tuple[dict | list, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = json.loads(r.read().decode("utf-8"))
        headers = dict(r.headers)
        return body, headers


def fetch_all(endpoint: str, params: dict | None = None) -> list:
    """Fetch all paginated results."""
    page = 1
    all_items = []
    while True:
        qp = {"per_page": "100", "page": str(page), **(params or {})}
        url = f"{BASE}/{endpoint}?{urllib.parse.urlencode(qp)}"
        print(f"  fetching page {page}...", file=sys.stderr)
        try:
            items, headers = fetch(url)
        except urllib.error.HTTPError as e:
            if e.code == 400 and page > 1:
                break  # past last page
            raise
        if not items:
            break
        all_items.extend(items)
        total_pages = int(headers.get("X-WP-TotalPages", "1"))
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.3)  # be polite
    return all_items


def main():
    print("Fetching posts (publicly embedded content + author + featured_media)...", file=sys.stderr)
    posts = fetch_all(
        "posts",
        {
            "_embed": "wp:featuredmedia,author,wp:term",
            "status": "publish",
        },
    )
    print(f"Got {len(posts)} posts", file=sys.stderr)
    (OUT / "posts.json").write_text(json.dumps(posts, indent=2, ensure_ascii=False))

    # Also grab categories, tags, users for lookup
    print("Fetching categories...", file=sys.stderr)
    categories = fetch_all("categories")
    (OUT / "categories.json").write_text(json.dumps(categories, indent=2))

    print("Fetching tags...", file=sys.stderr)
    tags = fetch_all("tags")
    (OUT / "tags.json").write_text(json.dumps(tags, indent=2))

    print("Fetching users...", file=sys.stderr)
    users = fetch_all("users")
    (OUT / "users.json").write_text(json.dumps(users, indent=2))

    print(
        json.dumps(
            {
                "posts": len(posts),
                "categories": len(categories),
                "tags": len(tags),
                "users": len(users),
            }
        )
    )


if __name__ == "__main__":
    main()
