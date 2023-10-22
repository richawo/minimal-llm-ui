import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  const filePath = (await request.json()).conversationPath;

  if (!fs.existsSync(filePath)) return new NextResponse("File does not exist", { status: 404 });

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting the file: " + err);
      return new NextResponse("Error deleting the file", { status: 500 });
    } else {
      console.log("File deleted successfully.");
      return new NextResponse("File deleted successfully", { status: 200 });
    }
  });

  return new NextResponse("File deleted successfully", { status: 200 });
}
