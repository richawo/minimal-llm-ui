import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  const req = await request.json();
  const dirRelativeToPublicFolder = req.conversationPath;
  const messages = req.messages;
  const filename = req.filename;
  const convoTitle = req.convoTitle;

  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Save file in JSON format
  const jsonData = JSON.stringify({title: convoTitle, messages: messages});
  fs.writeFileSync(path.join(dir, filename), jsonData);

  return new NextResponse(
    JSON.stringify({ message: "File saved successfully" }),
    {
      status: 200,
    },
  );
}
