/**
 * GET /api/comments/[slug]
 *
 * Returns approved comments for a post, oldest first (chronological reading).
 * Cached at the edge for 60s with stale-while-revalidate so a viral post
 * doesn't hammer Postgres.
 *
 * The slug param is the URL path *with* slashes encoded — e.g.
 * /api/comments/2026%2F04%2Fmy-post — to keep nested paths in a single segment.
 */

import { type NextRequest, NextResponse } from "next/server";
import { isDbConfigured, sql } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CommentRow {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: true, comments: [] });
  }

  const { slug: encoded } = await params;
  const slug = decodeURIComponent(encoded).replace(/^\/+|\/+$/g, "");

  if (!slug || slug.length > 200) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const rows = (await sql`
    SELECT id::text, author_name, body, created_at
    FROM comments
    WHERE post_slug = ${slug} AND status = 'approved'
    ORDER BY created_at ASC
    LIMIT 500
  `) as CommentRow[];

  return new NextResponse(JSON.stringify({ ok: true, comments: rows }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
