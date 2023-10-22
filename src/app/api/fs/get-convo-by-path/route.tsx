import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  const filePath = (await request.json()).conversationPath;
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return new NextResponse(JSON.stringify(jsonData), {
    status: 200,
  });
}
