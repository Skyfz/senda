import React from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { Eye, EyeOff, ChevronRight, Sparkles } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

import { useUser } from "@/context/user-context";

export default function BalanceCard() {
  const [showBalance, setShowBalance] = React.useState(true);
  const { globalUser } = useUser();
  
  // Fetch earnings rate only once
  const { data: earningsData } = useSWR('/api/admin/earnings', fetcher, {
    revalidateOnMount: true,
    refreshInterval: 0,  // Disable auto-refresh
    revalidateOnFocus: true,  // Don't revalidate on tab focus
    revalidateOnReconnect: true,  // Don't revalidate on reconnect
    fallbackData: { rate: 12.5 }
  });

  // Fetch wallet balance with auto-refresh
  const { data: walletData } = useSWR(
    globalUser?._id ? `/api/wallet/balance?userId=${globalUser._id}` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,  // Don't revalidate on tab focus
      revalidateOnReconnect: true,  // Don't revalidate on reconnect
      revalidateOnMount: true,
      fallbackData: { balance: 0 }
    }
  );

  const earningsRate = earningsData?.rate ? Number(earningsData.rate.toFixed(2)) : 0;
  const balance = walletData?.balance ? Number(walletData.balance) : 0;

  // Format balance with commas and 2 decimal places
  const formattedBalance = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  return (
    <Card shadow="lg" className="bg-gradient-to-bl from-sky-400 via-sky-600 to-sky-500 overflow-hidden relative max-w-2xl mx-auto">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c')] opacity-10 mix-blend-overlay" />
      
      <CardBody className="py-8 px-6 relative">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-white/90 text-sm">Available Balance</p>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-200/70"/>
                <p className="text-xs text-green-200/70">
                {showBalance ? `Earning ${earningsRate}% APY` : "--- -- ---"}
                </p>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {showBalance ? formattedBalance : "--- -- ---"}
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 px-4 py-2 rounded-full text-xs text-white/90">
              {showBalance ? "+2.4% Month" : "--- -- ---"}
            </div>
            <div className="bg-green-400/20 px-4 py-2 rounded-full text-xs text-green-100">
              {showBalance ? "+R45.30 Day" : "--- -- ---"}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}