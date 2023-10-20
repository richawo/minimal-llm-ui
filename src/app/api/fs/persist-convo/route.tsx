import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  const dirRelativeToPublicFolder = (await request.json()).conversationPath;

  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Save file in JSON format
  const jsonData = JSON.stringify({ name: "My File", content: "Hello World!" });
  fs.writeFileSync(path.join(dir, "myfile.json"), jsonData);

  return new NextResponse(
    JSON.stringify({ message: "File saved successfully" }),
    {
      status: 200,
    },
  );
}
