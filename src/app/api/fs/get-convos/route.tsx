import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {

  const dirRelativeToPublicFolder = (await request.json()).conversationPath;

  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  const filenames = fs.readdirSync(dir);

  const files = filenames.map((name) =>
    [name, path.join("/", dirRelativeToPublicFolder, name)],
  );

  return new NextResponse(JSON.stringify({ conversations: files}), {
    status: 200,
  });
};
