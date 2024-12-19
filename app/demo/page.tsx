"use client"
import { useState } from 'react';
import { Button } from '@nextui-org/react';

export default function Home() {
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

  const initiatePayment = async () => {
    try {
      const response = await fetch('/api/ozow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: '25.00',
          transactionReference: 'TEST123',
          bankReference: 'BANK_REF_123',
          cancelUrl: `${vercelUrl}/cancel`,
          errorUrl: `${vercelUrl}/error`,
          successUrl: `${vercelUrl}/success`,
          notifyUrl: `${vercelUrl}/notify`,
          isTest: true,
        }),
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      else {
        console.log('Payment initiation successful');
      }

      // Ensure the response is not empty before parsing
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      const data = JSON.parse(text);

      if (data.redirectUrl) {
        // Redirect to Ozow payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Payment URL not found in response');
      }
    } catch (error) {
      alert(
        error instanceof Error 
          ? `Payment initiation error: ${error.message}` 
          : 'An unexpected error occurred during payment initiation'
      );
    }
  };

  const generatePaymentUrl = async () => {
    try {
      const response = await fetch('/api/ozow', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment URL:', result.url);
      if (result.url) {
        setPaymentUrl(result.url);
      } else {
        console.error('No URL in response:', result);
      }
    } catch (error) {
      console.error('Error generating payment URL:', error);
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto flex flex-col gap-4'>
      <h1>Ozow Payment Integration</h1>
      <Button onClick={initiatePayment}>Start Test Payment</Button>
      <Button onClick={generatePaymentUrl}>Generate Payment URL</Button>
      {paymentUrl && <p>Payment URL: <a href={paymentUrl} target="_blank" rel="noopener noreferrer">{paymentUrl}</a></p>}
    </div>
  );
}