'use client';

import { Avatar } from "@nextui-org/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { useUser } from '@/context/user-context';
import SignOut from "@/components/sign-out";
import { Link } from "@nextui-org/link";
import { auth } from "@/auth"

interface AvatarDropdownProps {
  className?: string;
}

export default function AvatarDropdown({ className = "w-6 h-6 text-tiny" }: AvatarDropdownProps) {
  const { globalUser } = useUser();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar 
          as="button"
          className={`${className} transition-transform`}
          isBordered 
          color="primary" 
          src={globalUser?.image}
          name={globalUser?.name || "X"}
          data-dropdown-trigger="true"
        />
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Profile Actions"
        className="w-[240px]"
        closeOnSelect={false}
      >
        <DropdownItem key="profile" className="h-18 gap-2" href="/account">
          <div className="flex flex-col gap-1 cursor-pointer">
            <p className="font-medium text-default-600 text-small">
              {globalUser?.name}
            </p>
            <p className="text-default-500 text-tiny">
              {globalUser?.email}
            </p>
          </div>
        </DropdownItem>
        <DropdownItem key="settings" href="/settings">
          Settings
        </DropdownItem>
        <DropdownItem key="help_and_feedback" href="/help-feedback">
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
