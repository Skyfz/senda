'use client'

import { useState } from 'react'
import { useUser } from "@/context/user-context"
import { Card, CardBody, Input, Button } from "@nextui-org/react"
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Wallet, DollarSign } from 'lucide-react'


export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { globalUser } = useUser()
  const router = useRouter()

  const handleDeposit = async () => {
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
          type: 'deposit'
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAmount('')
      router.push('/')
    } catch (error) {
      console.error('Deposit failed:', error)
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
                  <h2 className="text-lg font-semibold pb-1">Deposit Funds</h2>
                  <p className="text-sm text-default-500">Add money to your wallet</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <ArrowUpRight className="w-6 h-6 text-success" />
                </div>
              </div>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Wallet className="w-5 h-5 text-default-500" />
                    <span className="text-sm font-medium">Amount to Deposit</span>
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
                  color='success'
                  onClick={handleDeposit}
                  isDisabled={loading || !amount}
                  isLoading={loading}
                >
                  {loading ? "Processing..." : "Confirm Deposit"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  )
}
