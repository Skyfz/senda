import React, { useEffect, useState } from 'react';
import { Card, CardBody, Button, Divider } from "@nextui-org/react";
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface Transaction {
  to_user_id: string;
  from_user_id?: string; // Updated to match the new structure
  from_username?: string;
  to_username?: string;
  bank_name?: string;
  transaction_type: 'deposit' | 'withdrawal'; // Adjusted to match the new structure
  amount: number; // Changed to number for easier calculations
  fee: number; // Added fee field
  net_amount: number; // Added net_amount field
  currency: string; // Added currency field
  status: string; // Added status field
  created_date: string; // Changed to created_date for consistency
  // ... other fields as necessary
}

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { globalUser } = useUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/transactions/get?userId=${globalUser?._id}`);
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [globalUser?._id]);

  return (
    <Card className="bg-opacity-50">
      <CardBody className="py-5 px-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h2 className="text-lg font-semibold pb-1">Recent&nbsp;Activity</h2>
            <p className="text-sm text-default-500">Today&apos;s&nbsp;transactions</p>
          </div>
          <div className="flex gap-2">
            {/* <Button
              variant="flat"
              className="bg-default-100"
              startContent={<Calendar size={18} />}
            >
              Date
            </Button> */}
            <Button
              variant="flat"
              className="bg-default-100"
              startContent={<Filter size={18} />}
            >
              Filter
            </Button>
          </div>
        </div>
        <Divider className='my-2'/>
        
        <div className="space-y-6">
  {transactions.map((tx, index) => (
    <div key={index}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${
            tx.transaction_type === "deposit" 
              ? "bg-success/10 text-success" 
              : "bg-default-100 text-default-600"
          }`}>
            {tx.transaction_type === "deposit" 
              ? <ArrowDownLeft size={20} /> 
              : <ArrowUpRight size={20} />
            }
          </div>
          <div>
            <p className="font-medium">{
              tx.transaction_type === "deposit"
                ? tx.bank_name
                : tx.to_username}
            </p>
            {/* <p className="text-sm text-default-500">{tx.category}</p> */}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${
            tx.transaction_type === "deposit" ? "text-foreground" : ""
          }`}>
            R {tx.net_amount} {/* Displaying net_amount and currency */}
          </p>
          {/* <p className="text-sm text-default-500">{new Date(tx.created_date).toLocaleDateString()}</p> Formatting date */}
        </div>
      </div>
      {index < transactions.length - 1 && (
        <Divider className="my-4" />
      )}
    </div>
  ))}
</div>
      </CardBody>
    </Card>
  );
}