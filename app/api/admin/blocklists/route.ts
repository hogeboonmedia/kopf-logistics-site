/**
 * POST /api/admin/blocklists       — add an entry
 * DELETE /api/admin/blocklists     — remove an entry
 *
 * Auth gated by middleware.ts (requires admin session cookie).
 *
 * Body: { kind: "ip" | "country" | "keyword", value: string, reason?: string }
 */

import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/server";
import {
  addBlockedCountry,
  addBlockedIp,
  addBlockedKeyword,
  removeBlockedCountry,
  removeBlockedIp,
  removeBlockedKeyword,
} from "@/lib/blocklists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  kind?: "ip" | "country" | "keyword";
  value?: string;
  reason?: string;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const value = (body.value ?? "").trim();
  if (!value) {
    return NextResponse.json({ ok: false, error: "Value is required" }, { status: 400 });
  }

  try {
    switch (body.kind) {
      case "country":
        if (!/^[A-Za-z]{2}$/.test(value)) {
          return NextResponse.json(
            { ok: false, error: "Country must be a 2-letter ISO code (e.g. PK, CN)" },
            { status: 400 },
          );
        }
        await addBlockedCountry(value, body.reason, session.login);
        break;

      case "ip":
        // Postgres INET will reject malformed input; let the DB validate.
        await addBlockedIp(value, body.reason, session.login);
        break;

      case "keyword":
        if (value.length < 2 || value.length > 200) {
          return NextResponse.json(
            { ok: false, error: "Keyword must be 2–200 characters" },
            { status: 400 },
          );
        }
        await addBlockedKeyword(value, body.reason, session.login);
        break;

      default:
        return NextResponse.json(
          { ok: false, error: "kind must be 'ip', 'country', or 'keyword'" },
          { status: 400 },
        );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const value = (body.value ?? "").trim();
  if (!value) {
    return NextResponse.json({ ok: false, error: "Value is required" }, { status: 400 });
  }

  try {
    switch (body.kind) {
      case "country":
        await removeBlockedCountry(value);
        break;
      case "ip":
        await removeBlockedIp(value);
        break;
      case "keyword":
        await removeBlockedKeyword(value);
        break;
      default:
        return NextResponse.json(
          { ok: false, error: "kind must be 'ip', 'country', or 'keyword'" },
          { status: 400 },
        );
    }
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
