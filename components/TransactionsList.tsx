import React from 'react';
import { Card, CardBody, Button, Divider } from "@nextui-org/react";
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter } from 'lucide-react';

export default function TransactionsList() {
  const transactions = [
    { 
      type: "Sent",
      amount: "-$50.00",
      to: "Sarah M.",
      date: "Today • 2:30 PM",
      category: "Transfer",
      status: "completed"
    },
    { 
      type: "Received",
      amount: "+$120.00",
      from: "John D.",
      date: "Today • 11:25 AM",
      category: "Payment",
      status: "completed"
    },
    { 
      type: "Sent",
      amount: "-$25.00",
      to: "Alex W.",
      date: "Yesterday",
      category: "Split Bill",
      status: "pending"
    },
  ];

  return (
    <Card className="bg-opacity-50">
      <CardBody className="py-5 px-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h2 className="text-lg font-semibold pb-1">Recent&nbsp;Activity</h2>
            <p className="text-sm text-default-500">Today&apos;s&nbsp;transactions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="flat"
              className="bg-default-100"
              startContent={<Calendar size={18} />}
            >
              Date
            </Button>
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
                    tx.type === "Received" 
                      ? "bg-success/10 text-success" 
                      : "bg-default-100 text-default-600"
                  }`}>
                    {tx.type === "Received" 
                      ? <ArrowDownLeft size={20} /> 
                      : <ArrowUpRight size={20} />
                    }
                  </div>
                  <div>
                    <p className="font-medium">{tx.to || tx.from}</p>
                    <p className="text-sm text-default-500">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === "Received" ? "text-success" : ""
                  }`}>
                    {tx.amount}
                  </p>
                  <p className="text-sm text-default-500">{tx.date}</p>
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