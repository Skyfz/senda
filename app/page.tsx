"use client";
import React from 'react';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import ActionButtons from '@/components/ActionButtons';
import RecentContacts from '@/components/RecentContacts';
import TransactionsList from '@/components/TransactionsList';

export default function Home() {

  return (
    <section className="flex flex-col w-full items-center justify-center">

      <div className="min-h-screen w-full max-w-2xl">
        {/* Main content */}
        <div className="">
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
