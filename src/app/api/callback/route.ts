import { adminAuth, adminDb } from "@/lib/firebase-admin";
import Genuka from "genuka";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("company_id");
  const code = searchParams.get("code");
  const timestamp = searchParams.get("timestamp");
  const hmac = searchParams.get("hmac");
  const redirectTo = decodeURIComponent(searchParams.get("redirect_to") || "/");
  // Validate parameters
  if (!companyId || !code || !timestamp || !hmac) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    // Exchange code for access token with Genuka
    const tokenResponse = await fetch(`${process.env.GENUKA_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uri: process.env.REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to obtain access token");
    }

    const { access_token } = await tokenResponse.json();

    // Get company data from Genuka
    const genuka = await Genuka.initialize({ id: companyId });
    const company = await genuka.company.retrieve();
    // Store company data in Firestore
    await adminDb
      .collection("companies")
      .doc(companyId)
      .set(
        {
          id: companyId,
          authorization_code: code,
          access_token,
          name: company.name,
          logoUrl: company.logoUrl,
          metadata: {
            ...company,
          },
          created_at: new Date(),
          updated_at: new Date(),
        },
        { merge: true }
      );

    // Create Firebase custom token
    const customToken = await adminAuth.createCustomToken(companyId, {
      company_id: companyId,
      access_token,
    });

    // Redirect with the token
    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set("token", customToken);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
