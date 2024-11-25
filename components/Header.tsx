import React from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/context/user-context';
import AvatarDropdown from './avatar-dropdown';

export default function Header() {
  const { globalUser } = useUser();
  return (
    <div className="flex items-center justify-between pb-4 pt-2">
      <div className="space-y-1">
        <h1 className="text-white text-2xl font-bold">Hi&nbsp;{globalUser?.name}</h1>
        <h2 className="text-white/80 text-sm font-medium">Welcome&nbsp;back</h2>
      </div>
      <div className="flex items-center gap-6">
        <AvatarDropdown className=""/>
        <button className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all">
          <Bell size={30} />
        </button>
      </div>
    </div>
  );
}