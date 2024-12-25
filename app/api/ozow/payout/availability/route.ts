import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const headersList = headers();
    const apiKey = process.env.OZOW_API_KEY;
    const siteCode = process.env.OZOW_SITE_CODE;

    // Validate required parameters
    if (!siteCode || !apiKey) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    const url = `https://stagingpayoutsapi.ozow.com/getavailablebanks`;

    // Make request to Ozow API
    const response = await fetch(url, {
      method: "GET",
        headers: {
            "APIKey": apiKey!,
            "SiteCode": siteCode!,
            "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Ozow API returned ${response.status}`);
    }
    
    const data = await response.json();

    console.log("Fetched transaction:", data);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch banks" },
      { status: 500 }
    );
  }
}
