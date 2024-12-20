'use client'

import { useState } from 'react'
import { useUser } from "@/context/user-context"
import { Card, CardBody, Input, Button } from "@nextui-org/react"
import { ArrowUpRight, Wallet, DollarSign, Share } from 'lucide-react'
import { Switch, cn } from '@nextui-org/react'
import React from 'react'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSelected, setIsSelected] = React.useState(true);
  const [isSelectedLink, setIsSelectedLink] = React.useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const { globalUser } = useUser()


  const initiateDeposit = async () => {
    if (isSelectedLink) {
      initiateDepositLink()
    } else {
      initiateDepositRedirect()
    }
  }

  const initiateDepositLink = async () => {
    if (!amount || 
      isNaN(Number(amount)) || 
      Number(amount) <= 9.99 ||
      !amount.toString().match(/^\d+(\.\d{0,2})?$/)) {
        alert('Please enter a valid amount.\nAmount must be greater than R10,00 and have maximum 2 decimal places.')
        return 
      }

      try {
        const response = await fetch('/api/ozowDeposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            transactionReference: globalUser?._id,
            bankReference: 'BANK_REF_123',
            isTest: isSelected,
            generateUrl: true // This flag tells the API to generate a URL instead of redirecting
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Server response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Response from server:', result);

        if (result.url) {
          setPaymentUrl(result.url);
          console.log('Payment URL set to:', result.url);
        } else {
          console.error('No URL in response:', result);
          alert('Failed to generate payment link. Please try again.');
        }
      } catch (error) {
        console.error('Error generating payment URL:', error);
        alert('Failed to generate payment link. Please try again.');
      }
  }


  const initiateDepositRedirect = async () => {

    if (!amount || 
      isNaN(Number(amount)) || 
      Number(amount) <= 9.99 ||
      !amount.toString().match(/^\d+(\.\d{0,2})?$/)) {
        alert('Please enter a valid amount.\nAmount must be greater than R10,00 and have maximum 2 decimal places.')
        return 
      }

    try {
      const response = await fetch('/api/ozowDeposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          transactionReference: globalUser?._id,
          bankReference: 'BANK_REF_123',
          isTest: isSelected,
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

  
  return (
    <section className="flex flex-col w-full items-center justify-center">
      <div className="min-h-screen w-full max-w-2xl">
        <div className="">
          
          <Card className="bg-opacity-50">
            <CardBody className="py-5 px-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <div>
                  <h2 className="text-lg font-semibold pb-1">Deposit Funds</h2>
                  <p className="text-sm text-default-500">Add money to your wallet</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <ArrowUpRight className="w-6 h-6 text-success" />
                </div>
              </div>

              <div className="space-y-6 mt-4">
                <div className="space-y-4">
                  
                  <div className="flex items-center gap-2 px-2">
                    <Wallet className="w-5 h-5 text-default-500" />
                    <span className="text-sm font-medium">Amount to Deposit</span>
                  </div>
                  <Input
                    size='lg'
                    color='success'
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    variant="bordered"
                    startContent={
                      <DollarSign className="w-4 h-4 text-default-400" />
                    }
                    className="w-full"
                  />
                </div>

                <Switch
                  isSelected={isSelected}
                  onValueChange={setIsSelected}
                  color='success'
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse min-w-full bg-content1 hover:bg-content2 items-center",
                      "justify-between rounded-lg gap-2 p-4 border-1 border-transparent",
                      "data-[selected=true]:border-success",
                    ),
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Test Transaction</p>
                    <p className="text-tiny text-default-400">
                      This toggle makes the transaction a test.
                    </p>
                  </div>
                </Switch>

                <Switch
                  isSelected={isSelectedLink}
                  onValueChange={setIsSelectedLink}
                  color='primary'
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse min-w-full bg-content1 hover:bg-content2 items-center",
                      "justify-between rounded-lg gap-2 p-4 border-1 border-transparent",
                      "data-[selected=true]:border-primary",
                    ),
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Payment Link</p>
                    <p className="text-tiny text-default-400">
                      This toggle generates a payment link.
                    </p>
                  </div>
                </Switch>

                <Button 
                  className="w-full"
                  color='success'
                  onClick={initiateDeposit}
                  isDisabled={loading || !amount}
                  isLoading={loading}
                >
                  {loading ? "Processing..." : "Confirm Deposit"}
                </Button>
                
                {paymentUrl && (
                  <div className="mt-4 flex gap-2 items-center">
                    <Button
                      className="w-full"
                      color="primary"
                      variant="bordered"
                      startContent={<Share className="h-4 w-4" />}
                      onClick={async () => {
                        if (typeof navigator.share === 'function') {
                          try {
                            await navigator.share({
                              title: 'Payment Link',
                              text: 'Here is your payment link',
                              url: paymentUrl
                            });
                          } catch (err) {
                            console.log('Error sharing:', err);
                          }
                        } else {
                          // Fallback to clipboard
                          try {
                            await navigator.clipboard.writeText(paymentUrl);
                            alert('Payment link copied to clipboard!');
                          } catch (err) {
                            console.log('Error copying to clipboard:', err);
                          }
                        }
                      }}
                    >
                      {typeof navigator.share === 'function' ? 'Share Payment Link' : 'Copy Payment Link'}
                    </Button>
                  </div>
                )}
                
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
}
