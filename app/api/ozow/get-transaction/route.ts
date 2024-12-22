import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const headersList = headers();
    const apiKey = process.env.OZOW_API_KEY;
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const siteCode = searchParams.get("siteCode");
    const transactionId = searchParams.get("transactionId");
    const isTest = searchParams.get("isTest") === "true";

    // Validate required parameters
    if (!siteCode || !transactionId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Construct the Ozow API URL
    const baseUrl = isTest 
      ? "https://stagingapi.ozow.com"
      : "https://api.ozow.com";
    
    const url = `${baseUrl}/GetTransaction?siteCode=${siteCode}&transactionId=${transactionId}`;

    console.log("Fetching transaction from Ozow API:", url);

    // Make request to Ozow API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "ApiKey": apiKey!,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ozow API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
