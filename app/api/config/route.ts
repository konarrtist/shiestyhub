'use client'; 
export const runtime = 'edge';

// rest of your code...
import { NextResponse } from "next/server";
export async function GET() {
  // We add '|| ""' so it splits an empty string instead of crashing if the variable is missing
  const superAdmins = (process.env.SUPER_ADMIN_USERNAMES || process.env.NEXT_PUBLIC_SUPER_ADMIN_USERNAMES || "");
  const escrowUsers = (process.env.ESCROW_USERNAMES || process.env.NEXT_PUBLIC_ESCROW_USERNAMES || "");

  return NextResponse.json({
    superAdminUsernames: superAdmins
      .split(",")
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean),
    escrowUsernames: escrowUsers
      .split(",")
      .map((u) => u.trim().toLowerCase())
      .filter(Boolean),
  });
}
