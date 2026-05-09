/**
 * POST /api/chat/stream — SSE proxy to the Kopf engine server.
 *
 * The Kopf engine (HOG-131) runs as a separate Node.js process.
 * This route proxies the SSE stream so the browser calls same-origin,
 * avoiding CORS. Set KOPF_ENGINE_URL in env (default: http://localhost:3001).
 *
 * SSE events forwarded verbatim: session, delta, answer,
 * clarifying_question, capture_offer, field_request,
 * capture_confirmed, done, error.
 */

import { type NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { readGeo } from "@/lib/request-geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE_URL = process.env.KOPF_ENGINE_URL ?? "http://localhost:3001";

interface StreamPayload {
  message?: string;
  sessionId?: string;
  clientId?: string;
}

function sseChunk(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function errorStream(message: string): ReadableStream {
  return new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(sseChunk("error", { message }));
      ctrl.close();
    },
  });
}

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "X-Accel-Buffering": "no",
} as const;

export async function POST(req: NextRequest) {
  const geo = readGeo(req.headers);
  const rl = rateLimit(`chat-stream:${geo.ip ?? "unknown"}`, 30, 60 * 60 * 1000);
  if (!rl.allowed) {
    return new Response(
      errorStream("Rate limit reached. For immediate help, call dispatch at 574.349.5600."),
      { headers: SSE_HEADERS, status: 429 },
    );
  }

  let body: StreamPayload;
  try {
    body = (await req.json()) as StreamPayload;
  } catch {
    return new Response(errorStream("Invalid request body"), {
      headers: SSE_HEADERS,
      status: 400,
    });
  }

  const message = (body.message ?? "").trim();
  if (!message || message.length > 2000) {
    return new Response(errorStream("Message required (1-2000 chars)"), {
      headers: SSE_HEADERS,
      status: 400,
    });
  }

  let engineRes: Response;
  try {
    engineRes = await fetch(`${ENGINE_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        clientId: body.clientId ?? "kopf",
        ...(body.sessionId ? { sessionId: body.sessionId } : {}),
      }),
    });
  } catch {
    return new Response(
      errorStream("Could not reach chat engine. Try again or call 574.349.5600."),
      { headers: SSE_HEADERS, status: 502 },
    );
  }

  if (!engineRes.body) {
    return new Response(errorStream("Empty response from engine"), {
      headers: SSE_HEADERS,
      status: 502,
    });
  }

  return new Response(engineRes.body, { headers: SSE_HEADERS });
}
