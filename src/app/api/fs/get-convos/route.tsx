import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {

  const dirRelativeToPublicFolder = (await request.json()).conversationPath;

  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  const filenames = fs.readdirSync(dir);

  const images = filenames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name),
  );

  return new NextResponse(JSON.stringify({ answer: images}), {
    status: 200,
  });
};
