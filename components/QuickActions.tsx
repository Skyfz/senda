import React from 'react';
import { Button, Tooltip } from "@nextui-org/react";
import { Send, Wallet, TrendingUp, QrCode, CreditCard, Gift } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { icon: <Send size={24} />, label: "Send", color: "primary" },
    { icon: <Wallet size={24} />, label: "Request", color: "secondary" },
    { icon: <QrCode size={24} />, label: "Scan", color: "success" },
    { icon: <CreditCard size={24} />, label: "Card", color: "warning" },
    { icon: <TrendingUp size={24} />, label: "Invest", color: "danger" },
    { icon: <Gift size={24} />, label: "Rewards", color: "primary" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Tooltip 
          content={action.label} 
          key={index}
          showArrow
          placement="bottom"
          classNames={{
            base: "bg-gradient-to-br from-white to-default-100 border border-default-200",
            arrow: "bg-default-200"
          }}
        >
          <Button
            className="h-24 bg-gradient-to-br from-white to-default-50 shadow-sm hover:shadow-md transition-all duration-300 border-default-200"
            variant="bordered"
          >
            <div className="flex flex-col items-center gap-2">
              <span className={`text-${action.color}`}>{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}