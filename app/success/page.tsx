'use client'

import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/context/user-context";

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
  const { globalUser } = useUser(); // Only need to read the user data
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('')
  const router = useRouter()

  const params = Object.entries(searchParams).map(([key, value]) => (
    <div key={key} className="mb-2">
      {key}: {value || "N/A"}
    </div>
  ));

  const handleDeposit = async () => {
    
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Transaction Successful</h1>
      <div className="p-4 rounded-lg">
        {params}
      </div>
      <Button className="mt-4" href="/" as="a">
        Return Home
      </Button>
    </div>
  );
}