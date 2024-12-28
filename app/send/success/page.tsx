'use client'

import { Button } from "@nextui-org/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardBody, Divider, Spinner } from "@nextui-org/react";
import { CheckCircle2, Copy, AlertCircle, SearchSlashIcon } from 'lucide-react';
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

export default function SendSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      const transactionId = searchParams.get('transactionId');
      const amount = searchParams.get('amount');
      const recipient = searchParams.get('recipient');

      console.log('Search Params:', { transactionId, amount, recipient });
      
      if (!transactionId || !amount || !recipient) {
        console.log('Missing required parameters:', { transactionId, amount, recipient });
        setError('Missing transaction parameters. Please try sending money again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transaction details');
        }

        const data = await response.json();
        
        setTransactionDetails(data);
        
        if (!data.timestamp) {
          setFormattedDate('N/A');
        } else {
          try {
            const date = new Date(data.timestamp);
            if (isNaN(date.getTime())) {
              throw new Error('Invalid timestamp');
            }
            
            const formattedDate = new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }).format(date);
            setFormattedDate(formattedDate);
          } catch (error) {
            console.error('Error formatting date:', error);
            setFormattedDate('Invalid date');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [searchParams]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="flex flex-col w-full items-center justify-center">
      <div className="min-h-screen w-full max-w-2xl">
        <Card isBlurred className="bg-opacity-50">
          <CardBody className="py-5 px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Spinner size="lg" color="success"/>
                <div className="text-default-500">Loading transaction details...</div>
              </div>
            ) : error ? (
              <>
                <div className="flex justify-between items-center mb-4 px-2">
                  <div>
                    <h2 className="text-lg font-semibold pb-1">Transaction Failed</h2>
                    <p className="text-sm text-danger">There was an error processing your payment</p>
                  </div>
                  <div className="p-3 bg-danger/10 rounded-full">
                    <AlertCircle className="w-8 h-8 text-danger" />
                  </div>
                </div>
                <div className="text-center py-8">
                  <div className="text-danger mb-4">{error}</div>
                  <Button 
                    color="primary"
                    onClick={() => router.push('/send')}
                  >
                    Try Again
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col justify-between items-center space-y-4 pb-4">
                  <div className="p-3 bg-success/10 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold pb-1 text-center">Money Sent Successfully</h2>
                    <p className="text-sm text-default-500 text-center">
                      Your payment has been sent to {searchParams.get('recipient')}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-small pt-4">
                    <span className="text-default-500">Amount Sent</span>
                    <span className="text-4xl font-semibold">R {searchParams.get('amount')}</span>
                  </div>
                  
                  <Divider className="my-4" />
                  
                  <div className="flex justify-between items-center text-small">
                    <span className="text-default-500">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse"/>
                      <span className="text-success font-medium">Completed</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-small">
                    <span className="text-default-500">Date & Time</span>
                    <span className="text-sm font-medium">{formattedDate}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-small">
                    <span className="text-default-500">Transaction ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-right">{searchParams.get('transactionId')}</span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-default-100 hover:bg-default-200"
                        onClick={() => copyToClipboard(searchParams.get('transactionId') || '')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-6">
                    <Button 
                      color="primary"
                      size="lg"
                      className="font-medium"
                      onClick={() => router.push('/send')}
                    >
                      Send More Money
                    </Button>
                    <Button 
                      variant="bordered"
                      size="lg"
                      className="font-medium"
                      onClick={() => router.push('/')}
                    >
                      Go Home
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  );
} 