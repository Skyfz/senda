import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import { Send, Wallet, Download, Upload } from 'lucide-react';

export default function ActionButtons() {
  const actions = [
    { icon: <Send size={24} />, label: "Send", color: "bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500 text-white" },
    { icon: <Wallet size={24} />, label: "Receive", color: "bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500 text-white" },
    { icon: <Download size={24} />, label: "Deposit", color: "bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500 text-white" },
    { icon: <Upload size={24} />, label: "Withdraw", color: "bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500 text-white" },
  ];

  return (
    <Card shadow="lg" isBlurred className="w-full bg-transparent">
      <CardBody className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-2 group transition-transform hover:scale-105"
            >
              <div className={`p-3 rounded-xl ${action.color} group-hover:opacity-90 transition-all`}>
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}