import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
const { exec } = require("child_process");

export async function POST(request: NextRequest) {
  let x = ""
  exec("ls -la", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
      x = stdout
  });

  return new NextResponse(JSON.stringify({name: "File deleted successfully", stdout: x}), { status: 200 });
}
