'use client'

import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { Card } from "@nextui-org/card";

interface SuccessPageProps {
  searchParams: {
    SiteCode?: string;
    TransactionId?: string;
    TransactionReference?: string;
    Amount?: string;
    Status?: string;
    Optional1?: string;
    Optional2?: string;
    Optional3?: string;
    Optional4?: string;
    Optional5?: string;
    CurrencyCode?: string;
    IsTest?: string;
    StatusMessage?: string;
    Hash?: string;
  };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const { globalUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyTransaction = async () => {
      if (!searchParams.TransactionReference || !searchParams.Status) {
        setError('Invalid transaction parameters');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionReference: searchParams.TransactionReference,
            ozowTransactionId: searchParams.TransactionId,
            amount: searchParams.Amount,
            status: searchParams.Status,
            statusMessage: searchParams.StatusMessage,
            isTest: searchParams.IsTest,
            hash: searchParams.Hash
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to verify transaction');
        }

        const result = await response.json();
        if (result.success) {
          setSuccess(true);
          // Redirect to wallet after 3 seconds
          setTimeout(() => {
            // router.push('/wallet');
          }, 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify transaction');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        {loading ? (
          <div className="text-center">
            <div className="mb-4">Verifying your payment...</div>
            {/* Add a loading spinner here if you want */}
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-danger mb-4">{error}</div>
            <Button 
              color="primary"
              onClick={() => router.push('/deposit')}
            >
              Try Again
            </Button>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="text-success mb-4">
              Payment successful! Amount: R{searchParams.Amount}
            </div>
            <div className="text-small text-default-500">
              Redirecting to wallet...
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}