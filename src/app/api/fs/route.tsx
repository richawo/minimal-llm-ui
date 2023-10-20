import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(request: NextRequest) {
  const dirRelativeToPublicFolder = "../src/app";

  const dir = path.resolve("./public", dirRelativeToPublicFolder);

  const filenames = fs.readdirSync(dir);

  const images = filenames.map((name) =>
    path.join("/", dirRelativeToPublicFolder, name),
  );

  // res.statusCode = 200;
  // res.json(images);
  return new NextResponse(JSON.stringify({ answer: images}), {
    status: 200,
  });
};

// export default request;
