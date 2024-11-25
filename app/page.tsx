"use client";
import React from 'react';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import RecentContacts from '@/components/RecentContacts';
import TransactionsList from '@/components/TransactionsList';

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
      
      <div className="min-h-screen">

      {/* Main content */}
      <div className="relative max-w-md mx-auto">
        <div className="pt-2 pb-4">
          <div>
            <Header />
            <div className="mt-4">
              <BalanceCard />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <ActionButtons />
          <RecentContacts />
          <TransactionsList />
        </div>
      </div>
    </div>

    </section>
  );
}
