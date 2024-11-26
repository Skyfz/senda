import React from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { Eye, EyeOff, ChevronRight, Sparkles } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

export default function BalanceCard() {
  const [showBalance, setShowBalance] = React.useState(true);
  
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
                {showBalance ? "Earning 2.5% APY" : "--- -- ---"}
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
            {showBalance ? "R 1,234.56" : "--- -- ---"}
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