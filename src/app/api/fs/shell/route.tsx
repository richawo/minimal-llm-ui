import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { exec } from "child_process";

export async function POST(request: NextRequest) {
  let x = "";

  exec("ls -la", (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.log(`stderr: ${stderr.toString()}`); // Convert Buffer to string
      return;
    }

    console.log(`stdout: ${stdout.toString()}`); // Convert Buffer to string
    x = stdout.toString(); // Convert Buffer to string
  });

  return new NextResponse(JSON.stringify({ name: "File deleted successfully", stdout: x }), { status: 200 });
}
