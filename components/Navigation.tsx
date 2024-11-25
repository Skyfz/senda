import React from 'react';
import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { Wallet, History, Settings, Bell, User } from 'lucide-react';

export default function Navigation() {
  const navItems = [
    { icon: <Wallet size={22} />, label: "Home", active: true },
    { icon: <History size={22} />, label: "Activity" },
    { icon: <Bell size={22} />, label: "Notifications" },
    { icon: <User size={22} />, label: "Profile" },
    { icon: <Settings size={22} />, label: "Settings" },
  ];

  return (
    <Card className="fixed bottom-8 left-1/2 -translate-x-1/2 max-w-[calc(100%-3rem)] w-full bg-white/90 backdrop-blur-xl border-none shadow-2xl">
      <CardBody className="p-2">
        <div className="flex justify-between items-center px-4">
          {navItems.map((item, index) => (
            <Tooltip 
              content={item.label} 
              key={index}
              showArrow
              placement="top"
              offset={10}
              classNames={{
                base: "bg-gradient-to-br from-white to-default-100 border border-default-200",
                arrow: "bg-default-200"
              }}
            >
              <Button
                isIconOnly
                variant={item.active ? "solid" : "light"}
                className={`${
                  item.active 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "hover:bg-default-100"
                } w-12 h-12 transition-all duration-300`}
              >
                {item.icon}
              </Button>
            </Tooltip>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}