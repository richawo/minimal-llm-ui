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
  const filePathsAndTitles: any[] = [];

  filenames.forEach((name) => {
    const filePath = path.join("./public", dirRelativeToPublicFolder, name);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (jsonData.hasOwnProperty("title")) {
      const title = jsonData.title;
      filePathsAndTitles.push({ title, filePath });
    }
  });

  return new NextResponse(JSON.stringify(filePathsAndTitles), {
    status: 200,
  });
}
