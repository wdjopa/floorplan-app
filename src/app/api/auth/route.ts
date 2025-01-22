import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { verifyHmac } from "@/utils/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("company_id");
  const timestamp = searchParams.get("timestamp");
  const hmac = searchParams.get("hmac");

  if (!companyId || !timestamp || !hmac) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // 1. Verify HMAC
    const params = Object.fromEntries(searchParams.entries());
    if (!verifyHmac(params, process.env.CLIENT_SECRET!)) {
      return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
    }

    // 2. Get company data from Firestore
    const companyDoc = await adminDb
      .collection("companies")
      .doc(companyId)
      .get();
    if (!companyDoc.exists) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyData = companyDoc.data()!;

    // 3. Create Firebase custom token with company data
    const customToken = await adminAuth.createCustomToken(companyId, {
      company_id: companyId,
      access_token: companyData.access_token,
    });

    // 4. Return the token
    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
