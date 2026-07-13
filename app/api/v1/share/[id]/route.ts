// D10 GET /api/v1/share/[id]
// 拉分享数据(share 页 server component 直接用 lib/share/kv 调,不走 API)
// 这个 API 主要是给客户端(老 share link 的 client fetch)用,或调试用

import { NextRequest, NextResponse } from "next/server";
import { getShare } from "@/lib/share/kv";
import { isValidShareId } from "@/lib/share/nanoid";
import type { ShareFetchResponse } from "@/lib/share/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isValidShareId(id)) {
    return NextResponse.json<ShareFetchResponse>(
      { ok: false, error: { code: "INVALID_ID", message: "Share ID format invalid." } },
      { status: 400 },
    );
  }
  const data = await getShare(id);
  if (!data) {
    return NextResponse.json<ShareFetchResponse>(
      { ok: false, error: { code: "NOT_FOUND", message: "Share link expired or not found." } },
      { status: 404 },
    );
  }
  return NextResponse.json<ShareFetchResponse>({ ok: true, data });
}
