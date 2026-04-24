/**
 * PATCH /api/admin/comments/[id]   — update status (approve / mark spam / unspam)
 * DELETE /api/admin/comments/[id]  — hard delete
 *
 * Auth gated by middleware.ts.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import { isDbConfigured, sql } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PatchBody {
  status?: "approved" | "spam" | "pending";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 503 });

  const { id } = await params;
  const numId = Number.parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.status || !["approved", "spam", "pending"].includes(body.status)) {
    return NextResponse.json(
      { ok: false, error: "status must be 'approved' | 'spam' | 'pending'" },
      { status: 400 },
    );
  }

  await sql`UPDATE comments SET status = ${body.status} WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 503 });

  const { id } = await params;
  const numId = Number.parseInt(id, 10);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  }

  await sql`DELETE FROM comments WHERE id = ${numId}`;
  return NextResponse.json({ ok: true });
}
