"use client";
import React from 'react';
import {
  Card,
  CardBody,
  Button,
  Avatar,
  User,
  Chip,
  ScrollShadow,
  Divider,
} from "@nextui-org/react";

import { Send, Wallet, TrendingUp } from 'lucide-react';

export default function Home() {

  const recentContacts = [
    { name: "Sarah M.", img: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "John D.", img: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Alex W.", img: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { name: "Emma S.", img: "https://i.pravatar.cc/150?u=a048581f4e29026701d" },
  ];

  const transactions = [
    { type: "Sent", amount: "-$50.00", to: "Sarah M.", date: "Today" },
    { type: "Received", amount: "+$120.00", from: "John D.", date: "Yesterday" },
    { type: "Sent", amount: "-$25.00", to: "Alex W.", date: "Yesterday" },
  ];

  return (
    <section className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center w-full">
      <div className="max-w-lg w-full space-y-4">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary-200 to-green-300">
          <CardBody className="py-8">
            <div className="text-foreground">
              <p className="text-sm opacity-90 pl-4 pb-4">Available Balance</p>
              <h1 className="text-4xl font-bold pl-4">R 1,234.56</h1>
            </div>
          </CardBody>
        </Card>
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Button
            startContent={<Send size={20} />}
            variant="light"
            className="h-20 bg-gradient-to-br from-primary-100 to-primary-400"
          >
            Send
          </Button>
          <Button
            startContent={<Wallet size={20} />}
            variant="light"
            className="h-20 bg-gradient-to-br from-primary-100 to-primary-400"
          >
            Request
          </Button>
          <Button
            startContent={<TrendingUp size={20} />}
            variant="light"
            className="h-20 bg-gradient-to-br from-primary-100 to-primary-400"
          >
            Invest
          </Button>
        </div>
        {/* Recent Contacts */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold m-2 pb-1">Recent Contacts</h2>
            <Divider orientation="horizontal" />
            <ScrollShadow className="flex gap-2 m-2">
              {recentContacts.map((contact, index) => (
                <Avatar
                  key={index}
                  src={contact.img}
                  size="lg"
                  className="cursor-pointer"
                />
              ))}
            </ScrollShadow>
          </CardBody>
        </Card>
        {/* Recent Transactions */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold m-2 pb-1">Recent Activity</h2>
            <Divider orientation="horizontal" />
            <div className="space-y-4 m-2 ">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between">
                  <User
                    name={tx.to || tx.from}
                    avatarProps={{
                      src: `https://i.pravatar.cc/150?u=a042581f4e29026${index}04d`
                    }}
                  />
                  <Chip
                    color={tx.type === "Received" ? "success" : "default"}
                    variant="flat"
                  >
                    {tx.amount}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>

    </section>
  );
}
