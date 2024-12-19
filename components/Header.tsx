import React from 'react';
import { Bell } from 'lucide-react';
import { useUser } from '@/context/user-context';
import AvatarDropdown from './avatar-dropdown';
import { Skeleton } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { useRouter } from 'next/navigation';

export default function Header() {
  const { globalUser } = useUser();
  const router = useRouter();
  const demoAction = { onClick: () => router.push('/demo')};

  if (!globalUser) {
    return (
      <div className="flex items-center justify-between pb-6 pt-4 px-2">
        <div className="space-y-2">
          <Skeleton className="rounded-lg">
            <div className="h-7 w-60"></div>
          </Skeleton>
          <Skeleton className="rounded-lg">
            <div className="h-4 w-30"></div>
          </Skeleton>
        </div>
        <div className="flex items-center gap-6">
          <Skeleton className="rounded-full">
            <div className="h-[46px] w-[46px]"></div>
          </Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between pb-6 pt-4 px-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Hi,&nbsp;{globalUser.name}</h1>
        <h2 className="text-foreground/80 text-sm font-medium">Welcome&nbsp;back</h2>
      </div>
      <div className="flex items-center gap-6">
        {/* <AvatarDropdown className=""/> */}
        <Button onClick={demoAction.onClick} variant='flat' color='default' isIconOnly={true} radius='full'>
          <Bell size={24} />
        </Button>
      </div>
    </div>
  );
}