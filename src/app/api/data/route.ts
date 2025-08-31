import { NextResponse } from "next/server";
import data from "@/lib/data/data.json"; // import your JSON file

export async function GET() {
  return NextResponse.json(data);
}