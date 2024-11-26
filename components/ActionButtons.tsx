import React from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { Send, Wallet, Download, Upload } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function ActionButtons() {
  const router = useRouter();
  
  const actions = [
    { 
      icon: <Send size={24} />, 
      label: "Send", 
      onClick: () => router.push('/send')
    },
    { 
      icon: <Wallet size={24} />, 
      label: "Receive", 
      onClick: () => router.push('/receive')  
    },
    { 
      icon: <Download size={24} />, 
      label: "Deposit", 
      onClick: () => router.push('/deposit')
    },
    { 
      icon: <Upload size={24} />, 
      label: "Withdraw", 
      onClick: () => router.push('/withdraw')
    },
  ];

  return (
    <Card shadow="lg" className='bg-transparent backdrop-filter backdrop-blur-2xl bg-opacity-20'>
      <CardBody>
        <div className="grid grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 min-h-[100px] "
              variant="light"
            >
              <div className="">
                {action.icon}
              </div>
              <span className="text-xs font-medium ">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}