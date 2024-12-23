'use client'

import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/context/user-context";
import { Card, CardBody, Divider, Spinner } from "@nextui-org/react";
import { CircleX, Copy, AlertCircle } from 'lucide-react';


interface ErrorPageProps {
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

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  
  const { globalUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [danger, setdanger] = useState(false);
  const [isAlreadyProcessed, setIsAlreadyProcessed] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [params, setParams] = useState<ErrorPageProps['searchParams']>(
    Object.keys(searchParams).length > 0
      ? searchParams
      : (() => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
          TransactionReference: urlParams.get('TransactionReference') || '',
          Status: urlParams.get('Status') || '',
          TransactionId: urlParams.get('TransactionId') || '',
          Amount: urlParams.get('Amount') || '',
          StatusMessage: urlParams.get('StatusMessage') || '',
          IsTest: urlParams.get('IsTest') || '',
          Hash: urlParams.get('Hash') || ''
        };
      })()
  );
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  // Extract relevant transaction details
  const { TransactionId, Amount, Status, StatusMessage } = searchParams;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  
  useEffect(() => {
    const verifyTransaction = async () => {
      if (!params.TransactionReference || !params.Status) {
        setError('Invalid transaction parameters');
        return;
      }

      setLoading(true);
      try {
        // First check the transaction status with Ozow
        const ozowResponse = await fetch(`/api/ozow/get-transaction?transactionId=${params.TransactionId}&isTest=${params.IsTest === 'true'}`);
        
        console.log('Ozow response:', ozowResponse);
        
        if (!ozowResponse.ok) {
          throw new Error('Failed to verify transaction with Ozow');
        }

        const ozowData = await ozowResponse.json();
        const transaction = Array.isArray(ozowData) ? ozowData[0] : ozowData;
        setTransactionDetails(transaction);
        
        // Only proceed with local verification if Ozow confirms the transaction is complete
        if (transaction.status !== 'Error') {
          throw new Error(`Transaction status: ${transaction.status}. ${transaction.statusMessage || ''}`);
        }

        // Now verify the transaction in our database
        const response = await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionReference: params.TransactionReference,
            ozowTransactionId: params.TransactionId,
            amount: params.Amount,
            status: params.Status,
            statusMessage: params.StatusMessage,
            isTest: params.IsTest,
            hash: params.Hash,
            ozowApiResponse: transaction
          }),
        });

        // const formattedDate = new Intl.DateTimeFormat('en-US', {
        //   year: 'numeric',
        //   month: '2-digit',
        //   day: '2-digit',
        //   hour: '2-digit',
        //   minute: '2-digit',
        //   second: '2-digit',
        //   hour12: false,
        // }).format(new Date(transaction.paymentDate));
        // setFormattedDate(formattedDate);

        if (!response.ok) {
          const data = await response.json();
          if (data.error === 'Transaction already processed') {
            // If transaction was previously processed, still show success but log it
            console.log('Transaction was previously processed:', params.TransactionReference);
            setIsAlreadyProcessed(true);
            setSuccess(true);
          } else {
            throw new Error(data.error || 'Failed to verify transaction');
          }
          return;
        }

        const result = await response.json();
        if (result.success) {
          setSuccess(true);
        } else {
          throw new Error(result.error || 'Failed to verify transaction');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify transaction');
      } finally {
        setLoading(false);
      }
    };

    verifyTransaction();
  }, [params]);

  return (
    <section className="flex flex-col w-full items-center justify-center">
      <div className="min-h-screen w-full max-w-2xl">
        <Card isBlurred className="bg-opacity-50">
          <CardBody className="py-5 px-4">

          {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Spinner size="lg" color="danger" />
                <div className="text-default-500">Fetching Errors...</div>
              </div>
            ) : error ? (
              <>
              <div className="flex justify-between items-center mb-4 px-2">
                <div>
                <h2 className="text-lg font-semibold pb-1">Transaction Error</h2>
                <p className="text-sm text-danger">An error occurred while processing.</p>

                </div>
                <div className="p-3 bg-danger/10 rounded-full">
                  <AlertCircle className="w-8 h-8 text-danger" />
                </div>
              </div>
              <div className="text-center py-8">
                <div className="text-danger mb-4">{error}</div>
                <Button 
                  color="primary"
                  onClick={() => router.push('/deposit')}
                >
                  Try Again
                </Button>
              </div>
            </>
              ) : success ? (
                <>
            <div className="flex flex-col justify-between items-center space-y-4 pb-4">
              <div className="p-3 bg-danger/10 rounded-full">
                <CircleX className="w-8 h-8 text-danger" />
              </div>
              <div>
                <h2 className="text-lg font-semibold pb-1 text-center">Transaction Error</h2>
                <p className="text-sm text-default-500 text-center">Your deposit has encountered an error</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-small pt-4">
                <span className="text-default-500">Amount</span>
                <span className="text-4xl font-semibold">{params.CurrencyCode}&nbsp;{params.Amount}</span>
              </div>
              
              <Divider className="my-4" />
              
              <div className="flex justify-between items-center text-small">
                <span className="text-default-500">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse"/>
                  <span className="text-danger font-medium">{params.Status}</span>
                </div>
              </div>

              {/* <div className="flex justify-between items-center text-small">
                <span className="text-default-500">Date & Time</span>
                <span className="text-sm font-medium">
                  {formattedDate}
                </span>
              </div> */}

              <div className="flex justify-between items-center text-small">
                        <span className="text-default-500 ">Transaction ID</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-right">{params.TransactionId}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="bg-default-100 hover:bg-default-200"
                            onClick={() => copyToClipboard(params.TransactionId || '')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
              
              {params.IsTest === 'true' && (
                <div className="p-2 bg-warning-50 rounded-lg">
                  <p className="text-warning text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    This was a test transaction
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button 
                color="primary"
                size="lg"
                className="font-medium"
                onClick={() => router.push('/deposit')}
              >
                Make Another Deposit
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
                    </>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}