'use client'

import { useState } from 'react'
import { useUser } from "@/context/user-context"
import { Card, CardBody, Input, Button,Tabs, Tab, Divider} from "@nextui-org/react"
import { ArrowUpRight, Wallet, Share, Copy, Hash } from 'lucide-react'
import { Switch, cn } from '@nextui-org/react'
import React from 'react'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTest, setIsTest] = React.useState(true);
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>(undefined);
  const [selectedTab, setSelectedTab] = React.useState<string | number>("pay_now");
  const { globalUser } = useUser()

  // Fee calculation constants
  const TRANSACTION_FEE_PERCENTAGE = 3; // 3%
  const MINIMUM_FEE = 3; // R2 minimum fee
  const MINIMUM_DEPOSIT_AMOUNT = 10; // R10 minimum deposit

  // Calculate fees based on amount
  const calculateFees = (inputAmount: string) => {
    const numAmount = Number(inputAmount) || 0;
    const calculatedFee = numAmount === 0 ? 0 : Math.max(
      MINIMUM_FEE,
      (numAmount * TRANSACTION_FEE_PERCENTAGE) / 100
    );
    return {
      amount: numAmount,
      fee: calculatedFee,
      total: numAmount + calculatedFee
    };
  }

  // Get current calculations
  const calculations = calculateFees(amount);

  // Function to generate bank reference
  const generateBankReference = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const isPM = now.getHours() >= 12;
    const time = now.getHours() % 12 || 12;
    const ampm = isPM ? 'p' : 'a';
    return `snda_${day}_${month}_${year}_${time}${ampm}`;
  };

  const initiateDeposit = async () => {
    if (selectedTab === 'link') {
      initiateDepositLink()
    } else {
      initiateDepositRedirect()

    }
  }

  const initiateDepositLink = async () => {
    if (!calculations.total || 
      isNaN(Number(amount)) || 
      Number(amount) < MINIMUM_DEPOSIT_AMOUNT ||
      !amount.toString().match(/^\d+(\.\d{0,2})?$/)) {
        alert(`Please enter a valid amount.\nAmount must be greater than or equal to R${MINIMUM_DEPOSIT_AMOUNT},00 and have maximum 2 decimal places.`)
        return 
    }

    try {
      // Create transaction record first
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_id: null, // external deposit
          to_user_id: globalUser?._id,
          transaction_type: 'deposit',
          amount: calculations.amount,
          fee: calculations.fee,
          currency: 'ZAR',
          status: 'pending'
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction record');
      }

      const transactionData = await transactionResponse.json();

      // Then initiate Ozow payment
      const response = await fetch('/api/ozowDeposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculations.total, // Use total amount including fees
          transactionReference: transactionData.transaction_id,
          bankReference: generateBankReference(),
          isTest: isTest,
          generateUrl: true
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

    if (!calculations.total || 
      isNaN(Number(amount)) || 
      Number(amount) < MINIMUM_DEPOSIT_AMOUNT ||
      !amount.toString().match(/^\d+(\.\d{0,2})?$/)) {
        alert(`Please enter a valid amount.\nAmount must be greater than or equal to R${MINIMUM_DEPOSIT_AMOUNT},00 and have maximum 2 decimal places.`)
        return 
      }

    
    setLoading(true)

    try {
      // Create transaction record first
      const transactionResponse = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_user_id: null, // external deposit
          to_user_id: globalUser?._id,
          transaction_type: 'deposit',
          amount: calculations.amount,
          fee: calculations.fee,
          currency: 'ZAR',
          status: 'pending'
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error('Failed to create transaction record');
      }

      const transactionData = await transactionResponse.json();

      const response = await fetch('/api/ozowDeposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculations.total, // Use total amount including fees
          transactionReference: transactionData.transaction_id,
          bankReference: generateBankReference(),
          isTest: isTest,
          generateUrl: false
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

              <div className='w-full flex flex-col items-center justify-center'>
                <Tabs 
                  fullWidth
                  aria-label="Options" 
                  className='px-1'
                  selectedKey={selectedTab}
                  onSelectionChange={setSelectedTab}
                  >
                    {/* Direct Deposit Section */}
                    <Tab key="pay_now" title="Pay Now">
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
                              <p className="text-default-400 pointer-events-none flex flex-col justify-center font-bold text-md">R</p>
                            }
                            className="w-full"
                          />

                          {/* Fee Breakdown Card */}
                          <Card isBlurred className="">
                            <CardBody className="gap-2">
                              <div className="flex justify-between text-small">
                                <span className="text-default-500">Amount:</span>
                                <span>R {calculations.amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-small">
                                <span className="text-default-500">Service Fee ({TRANSACTION_FEE_PERCENTAGE}%):</span>
                                <span>R {calculations.fee.toFixed(2)}</span>
                              </div>
                              <Divider className="my-2"/>
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>R {calculations.total.toFixed(2)}</span>
                              </div>
                              <div className="text-tiny text-default-400 mt-2">
                                *Minimum deposit of R{MINIMUM_DEPOSIT_AMOUNT.toFixed(2)} applies<br/>
                                *Minimum fee of R{MINIMUM_FEE.toFixed(2)} applies<br/>
                                *Fees are non-refundable
                              </div>
                            </CardBody>
                          </Card>

                          <Switch
                            isSelected={isTest}
                            onValueChange={setIsTest}
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
                              <p className="text-medium font-semibold">Test Transaction</p>
                              <p className="text-tiny text-default-400">
                                This toggle makes the transaction a test
                              </p>
                            </div>
                          </Switch>

                          <Button 
                            className="w-full"
                            color="success"
                            size="lg"
                            onClick={initiateDeposit}
                            isDisabled={loading || !amount}
                            isLoading={loading}
                          >
                            {loading ? "Going to Ozow..." : "Confirm Deposit"}
                          </Button>
                        </div>
                      </div>
                    </Tab>
                    {/* Link Deposit Section */}
                    <Tab key="link" title="Link">
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
                            <p className="text-default-400 pointer-events-none flex flex-col justify-center font-bold text-md">R</p>
                          }
                          className="w-full"
                        />

                          {/* Fee Breakdown Card */}
                          <Card isBlurred className="">
                            <CardBody className="gap-2">
                              <div className="flex justify-between text-small">
                                <span className="text-default-500">Amount:</span>
                                <span>R {calculations.amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-small">
                                <span className="text-default-500">Service Fee ({TRANSACTION_FEE_PERCENTAGE}%):</span>
                                <span>R {calculations.fee.toFixed(2)}</span>
                              </div>
                              <Divider className="my-2"/>
                              <div className="flex justify-between font-medium">
                                <span>Total:</span>
                                <span>R {calculations.total.toFixed(2)}</span>
                              </div>
                              <div className="text-tiny text-default-400 mt-2">
                                *Minimum deposit of R{MINIMUM_DEPOSIT_AMOUNT.toFixed(2)} applies<br/>
                                *Minimum fee of R{MINIMUM_FEE.toFixed(2)} applies<br/>
                                *Fees are non-refundable
                              </div>
                            </CardBody>
                          </Card>

                          <Switch
                            isSelected={isTest}
                            onValueChange={setIsTest}
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
                              <p className="text-medium font-semibold">Test Transaction</p>
                              <p className="text-tiny text-default-400">
                                This toggle makes the transaction a test
                              </p>
                            </div>
                          </Switch>

                          <Button 
                            className="w-full"
                            color="success"
                            size="lg"
                            onClick={initiateDeposit}
                            isDisabled={loading || !amount}
                            isLoading={loading}
                          >
                            {loading ? "Processing..." : "Generate Link"}
                          </Button>
                          
                          <div className="flex flex-col gap-2 space-y-4">
                            {paymentUrl ? (
                              <>
                                <div className="">
                                  <Button
                                    className="w-full"
                                    size='lg'
                                    onClick={() => window.open(paymentUrl, '_blank')}
                                  >
                                    {paymentUrl}
                                  </Button>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                  size='lg'
                                    className="flex-1"
                                    color="success"
                                    variant="flat"
                                    startContent={<Copy className="h-4 w-4" />}
                                    onClick={async () => {
                                      if (!paymentUrl) {
                                        alert("No payment link available to copy");
                                        return;
                                      }
                                      try {
                                        await navigator.clipboard.writeText(paymentUrl);
                                        alert("Payment link copied to clipboard!");
                                      } catch (err) {
                                        console.log('Error copying to clipboard:', err);
                                        alert("Failed to copy link");
                                      }
                                    }}
                                  >
                                    Copy
                                  </Button>

                                  <Button
                                  size='lg'
                                    className="flex-1"
                                    color="success"
                                    variant="flat"
                                    startContent={<Share className="h-4 w-4" />}
                                    onClick={async () => {
                                      if (typeof navigator.share === 'function') {
                                        try {
                                          await navigator.share({
                                            title: 'Payment Link',
                                            text: 'Here is your payment link',
                                            url: paymentUrl,
                                          });
                                        } catch (err) {
                                          console.log('Error sharing:', err);
                                          alert("Failed to share link");
                                        }
                                      }
                                    }}
                                  >
                                    Share
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="mt-4 p-4 bg-default-100 rounded-lg text-default-500 text-center">
                                Enter an amount and click &quot;Generate Link&quot; to create a payment link
                              </div>
                            )}
                          </div>
                  
                        </div>
                      </div>
                      </Tab>

                </Tabs>
              </div>

              
            </CardBody>
          </Card>

          
        </div>
      </div>
    </section>
  )
}
