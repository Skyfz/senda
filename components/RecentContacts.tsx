import React from 'react';
import { Card, CardBody, Avatar, ScrollShadow, Button } from "@nextui-org/react";
import { Plus, Search } from 'lucide-react';

export default function RecentContacts() {
  const contacts = [
    { name: "Sarah M.", img: "https://i.pravatar.cc/150?u=a042581f4e29026024d", status: "online" },
    { name: "John D.", img: "https://i.pravatar.cc/150?u=a042581f4e29026704d", status: "offline" },
    { name: "Alex W.", img: "https://i.pravatar.cc/150?u=a04258114e29026702d", status: "online" },
    { name: "Emma S.", img: "https://i.pravatar.cc/150?u=a048581f4e29026701d", status: "online" },
    { name: "Mike R.", img: "https://i.pravatar.cc/150?u=a042581f4e29026024e", status: "offline" },
  ];

  return (
    <Card className="bg-opacity-50">
      <CardBody className="py-5 px-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Quick Send</h2>
            <p className="text-sm text-default-500">Recent contacts</p>
          </div>
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="flat"
              className="bg-default-100"
            >
              <Search size={18} />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              className="bg-default-100"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
        
        <ScrollShadow 
          className="flex gap-6 py-2" 
          orientation="horizontal"
          hideScrollBar
        >
          {contacts.map((contact, index) => (
            <div key={index} className="flex flex-col items-center gap-2 min-w-fit">
              <div className="relative p-1">
                <Avatar
                  src={contact.img}
                  size="lg"
                  className="w-16 h-16 cursor-pointer hover:ring-2 ring-primary transition-all"
                />
                <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                  contact.status === 'online' ? 'bg-success' : 'bg-default-300'
                }`} />
              </div>
              <span className="text-sm font-medium">{contact.name}</span>
            </div>
          ))}
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}