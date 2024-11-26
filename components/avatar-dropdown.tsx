'use client';

import { Avatar } from "@nextui-org/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { useUser } from '@/context/user-context';
import SignOut from "@/components/sign-out";
import { IoIosSettings } from "react-icons/io";
import { RiChat1Line } from "react-icons/ri";

interface AvatarDropdownProps {
  className?: string;
}

export default function AvatarDropdown({ className = "w-6 h-6 text-tiny" }: AvatarDropdownProps) {
  const { globalUser } = useUser();

  return (
    <Dropdown backdrop="transparent">
      <DropdownTrigger>
        <Avatar 
          as="button"
          className={`${className} transition-transform hover:scale-105`}
          isBordered 
          color="primary" 
          src={globalUser?.image || ""}
          data-dropdown-trigger="true"
        />
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Profile Actions"
        className="w-[240px]"
        closeOnSelect={false}
      >
        <DropdownItem key="profile" className="h-18 gap-2 pb-4" href="/account">
          <div className="flex flex-col gap-1 cursor-pointer">
            <p className="font-medium text-default-600 text-small">
              {globalUser?.name || "No User"}
            </p>
            <p className="text-default-500 text-tiny">
              {globalUser?.email || "Sign in to access your account"}
            </p>
          </div>
        </DropdownItem>
        <DropdownItem key="settings" href="/settings" startContent={<IoIosSettings/>}>
          Settings
        </DropdownItem>
        <DropdownItem key="help_and_feedback" href="/help-feedback" startContent=<RiChat1Line />>
          Help & Feedback
        </DropdownItem>
        <DropdownItem 
          key="logout"
          className="text-danger hover:!bg-danger-50"
        >
          <SignOut closeDropdown />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
