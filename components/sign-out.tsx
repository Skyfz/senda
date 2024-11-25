"use client"
import { signOutGlobal } from "@/app/actions/auth"
import {    Modal,   
            ModalContent,   
            ModalHeader,   
            ModalBody,   
            ModalFooter} 
            from "@nextui-org/modal";
import {useDisclosure} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignOutProps {
  closeDropdown?: boolean;
}

export default function SignOut({ closeDropdown }: SignOutProps) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [confirmed, setConfirmed] = useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        setConfirmed(true);
        await signOutGlobal();
        if (closeDropdown) {
            onOpenChange();
        }
        router.refresh();
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the dropdown from closing
        onOpen();
    };

    const handleModalChange = (open: boolean) => {
        if (isOpen !== open) {
            onOpenChange();
        }
        // Close dropdown when modal closes
        if (!open && closeDropdown) {
            // Small delay to ensure smooth transition
            setTimeout(() => {
                const dropdownTrigger = document.querySelector('[data-dropdown-trigger="true"]') as HTMLElement;
                dropdownTrigger?.click();
            }, 100);
        }
    };

    return (
        <>
          <button 
            onClick={handleClick}
            className="w-full text-left"
          >
            Sign Out
          </button>
          <Modal 
            isOpen={isOpen} 
            onOpenChange={handleModalChange}
            hideCloseButton={confirmed}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Sign Out</ModalHeader>
                  <ModalBody>
                    <p> 
                      Are you sure you would like to sign out?
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button 
                      color="danger" 
                      variant="light" 
                      onPress={onClose}
                      isDisabled={confirmed}
                    >
                      Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        isLoading={confirmed}
                        onPress={handleSignOut}
                        isDisabled={confirmed}
                    >
                        Confirm
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
    );
}