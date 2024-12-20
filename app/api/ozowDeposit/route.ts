import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateOzowHashCheck } from '@/utils/ozow';

const SITE_CODE = process.env.OZOW_SITE_CODE!;
const COUNTRY_CODE = process.env.OZOW_COUNTRY_CODE!;
const CURRENCY_CODE = process.env.OZOW_CURRENCY_CODE!;
const PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY!;
const API_KEY = process.env.OZOW_API_KEY!;
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
const cancelUrl = `${vercelUrl}/cancel`;
const errorUrl = `${vercelUrl}/error`;
const successUrl = `${vercelUrl}/success`;
const notifyUrl = `${vercelUrl}/notify`;

export async function POST(req: NextRequest) {
  try {
    const { amount, transactionReference, bankReference, isTest, generateUrl = false } = await req.json();

    if (!amount || !transactionReference || !bankReference) {
      console.error('Missing required fields', { amount, transactionReference, bankReference });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const paymentData = {
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
      isTest
    };

    // Generate hash check
    const hashCheck = generateOzowHashCheck(paymentData, PRIVATE_KEY);

    if (generateUrl) {
      const requestData = {
        ...paymentData,
        hashCheck,
        apiKey: API_KEY,
        GenerateShortUrl: true
      };

      console.log('Request data for URL generation:', requestData);

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
      console.log('Ozow API Response:', result);
      return NextResponse.json(result);
    }

    const redirectData = {
      ...paymentData,
      hashCheck,
      apiKey: API_KEY
    };

    const redirectUrl = `https://pay.ozow.com?${new URLSearchParams(redirectData).toString()}`;
    return NextResponse.json({ redirectUrl });

  } catch (error) {
    console.error('Error processing payment request:', error);
    return NextResponse.json({ error: 'Failed to process payment request' }, { status: 500 });
  }
}
