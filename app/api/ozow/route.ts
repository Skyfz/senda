import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateOzowHashCheck } from '@/utils/ozow';

export async function POST(
  req: NextRequest
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('Method Not Allowed');
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  // Your provided credentials
  const SITE_CODE = process.env.OZOW_SITE_CODE!;
  const COUNTRY_CODE = process.env.OZOW_COUNTRY_CODE!;
  const CURRENCY_CODE = process.env.OZOW_CURRENCY_CODE!;
  const PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY!;
  const API_KEY = process.env.OZOW_API_KEY!;

  try {
    // Extract and validate request data
    const { amount, transactionReference, bankReference, cancelUrl, errorUrl, successUrl, notifyUrl, isTest } = await req.json();
    if (!amount || !transactionReference || !bankReference) {
      console.error('Missing required fields', { amount, transactionReference, bankReference });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Log request details
    console.log('Initiating payment with details:', { amount, transactionReference, bankReference });

    // Generate hash check
    const hashCheck = generateOzowHashCheck(
      {
        siteCode: SITE_CODE,
        countryCode: COUNTRY_CODE,
        currencyCode: CURRENCY_CODE,
        amount,
        transactionReference,
        bankReference,
        cancelUrl,
        errorUrl,
        successUrl,
        notifyUrl,
        isTest,
      },
      PRIVATE_KEY
    );

    // Prepare request data
    const requestData = {
      siteCode: SITE_CODE,
      countryCode: COUNTRY_CODE,
      currencyCode: CURRENCY_CODE,
      amount,
      transactionReference,
      bankReference,
      cancelUrl,
      errorUrl,
      successUrl,
      notifyUrl,
      isTest,
      hashCheck: hashCheck
    };

    // Return redirect URL response
    const redirectUrl = `https://pay.ozow.com?${new URLSearchParams(requestData).toString()}`;
    return NextResponse.json({ redirectUrl });
  }
  catch (error) {
    console.error('Error during payment initiation:', error);
    return NextResponse.json({ 
      message: error instanceof Error ? error.message : 'Payment initiation failed' 
    }, { status: 500 });

  }
};

// Generate payment URL
export async function GET() {
  try {
    const SITE_CODE = process.env.OZOW_SITE_CODE!;
    const PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY!;
    const API_KEY = process.env.OZOW_API_KEY!;

    const paymentData = {
      siteCode: SITE_CODE,
      countryCode: "ZA",
      currencyCode: "ZAR",
      amount: "25.00",
      transactionReference: "Test1",
      bankReference: "Test1",
      cancelUrl: "http://localhost:3000/cancel",
      errorUrl: "http://localhost:3000/error",
      successUrl: "http://localhost:3000/success",
      notifyUrl: "http://localhost:3000/notify",
      isTest: true
    };

    // Generate hash check
    const hashCheck = generateOzowHashCheck(paymentData, PRIVATE_KEY);
    console.log('Generated hash:', hashCheck); // For debugging

    const requestData = {
      ...paymentData,
      hashCheck,
      GenerateShortUrl: true
    };

    console.log('Request data:', requestData); // For debugging

    const response = await fetch('https://api.ozow.com/postpaymentrequest', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'ApiKey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ozow API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Ozow API Response:', result); // For debugging
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating payment URL:', error);
    return NextResponse.json({ error: 'Failed to generate payment URL' }, { status: 500 });
  }
}