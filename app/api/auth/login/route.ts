import { NextResponse } from "next/server";
import { createToken, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password;

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Senha invalida" }, { status: 401 });
  }

  const token = await createToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    ...COOKIE_OPTIONS,
    value: token,
  });

  return response;
}
