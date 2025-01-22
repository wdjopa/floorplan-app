import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { company_id, access_token } = await request.json();

    // Create custom token with company claims
    const customToken = await adminAuth.createCustomToken(company_id, {
      company_id,
      access_token,
    });

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Error creating custom token:", error);
    return NextResponse.json(
      { error: "Failed to create authentication token" },
      { status: 500 }
    );
  }
}
