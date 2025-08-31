import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API working!",
    db: process.env.DATABASE_URL ? "Available" : "Missing"
  });
}