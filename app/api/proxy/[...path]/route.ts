import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.clinicaexperts.com.br/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = "/" + path.join("/");
  const key = process.env.CLINICA_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const search = request.nextUrl.search || "";
  const targetUrl = `${API_BASE}${apiPath}${search}`;

  const res = await fetch(targetUrl, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
