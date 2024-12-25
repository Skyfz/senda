'use client'

import { useState } from 'react'
import { useUser } from "@/context/user-context"
import { Card, CardBody, Input, Button } from "@nextui-org/react"
import { useRouter } from 'next/navigation'
import { ArrowDownLeft, Wallet, DollarSign } from 'lucide-react'
import { useEffect } from 'react'

export default function WithdrawPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { globalUser } = useUser()
  const router = useRouter()
  const [availability, setAvailability] = useState(null)

  // Fetch availability on component mount
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch('/api/ozow/payout/availability');
        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }
        const data = await response.json();
        setAvailability(data);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    fetchAvailability();
  }, []);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/wallet/balance?userId=${globalUser?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          type: 'withdrawal'
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAmount('')
      router.push('/')
    } catch (error) {
      console.error('Withdrawal failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col w-full items-center justify-center">
      <div className="min-h-screen w-full max-w-2xl">
        <div className="pt-2 pb-4">
          <Card className="mt-6 bg-opacity-50">
            <CardBody className="py-5 px-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <div>
                  <h2 className="text-lg font-semibold pb-1">Withdraw Funds</h2>
                  <p className="text-sm text-default-500">Withdraw money from your wallet</p>
                </div>
                <div className="p-3 bg-danger/10 rounded-full">
                  <ArrowDownLeft className="w-6 h-6 text-danger" />
                </div>
              </div>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Wallet className="w-5 h-5 text-default-500" />
                    <span className="text-sm font-medium">Amount to Withdraw</span>
                  </div>
                  <Input
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

                <Button 
                  className="w-full"
                  color="danger"
                  onClick={handleWithdraw}
                  isDisabled={loading || !amount}
                  isLoading={loading}
                >
                  {loading ? "Processing..." : "Confirm Withdrawal"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="pt-2 pb-4">
          <Card className="mt-6 bg-opacity-50">
            <CardBody className="py-5 px-4">
              {/* Display availability data */}
              {availability && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Availability</h3>
                  <p>{JSON.stringify(availability)}</p>
                </div>
              )}
              {/* ... existing withdrawal form ... */}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
}
