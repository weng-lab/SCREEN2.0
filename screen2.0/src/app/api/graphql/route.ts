import { NextRequest, NextResponse } from "next/server";
import Config from "../../../config.json";

export async function POST(request: NextRequest) {
  const body = await request.text();

  const response = await fetch(Config.API.CcreAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.SCREEN_API_KEY!,
    },
    body,
  });

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
