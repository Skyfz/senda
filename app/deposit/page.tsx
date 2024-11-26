'use client'

import { useState } from 'react'
import { useUser } from "@/context/user-context"
import { Card, CardBody, Input, Button } from "@nextui-org/react"

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const { globalUser } = useUser()

  const handleDeposit = async () => {
    if (!amount || isNaN(Number(amount))) {
     
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
          balance: Number(amount)
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }


      setAmount('')
    } catch (error) {
     
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardBody className="gap-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Deposit Funds</h2>
            <p className="text-default-500">Add money to your wallet</p>
          </div>
          <Input
            type="number"
            label="Amount"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            variant="bordered"
          />
          <Button 
            className="w-full bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500"
            onClick={handleDeposit}
            isDisabled={loading || !amount}
            isLoading={loading}
          >
            {loading ? "Processing..." : "Deposit"}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
