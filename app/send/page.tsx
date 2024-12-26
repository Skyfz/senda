"use client";

import { Search, X, MoreHorizontal, MoreVertical, Divide } from "lucide-react";
import { Button, Card, CardBody, Divider, Input, Listbox, ListboxItem, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Skeleton } from "@nextui-org/react";
import { Kbd } from "@nextui-org/kbd";
import { useEffect, useState, ReactNode } from "react";
import { useUser } from '@/context/user-context';
import RecentContacts from "@/components/RecentContacts";
import React from "react";

interface Contact {
    email: string; // Add other properties as needed
    name: string;
    image?: string; // Optional if it can be undefined
    status?: string; // Optional if it can be undefined
    bio?: string;   //
}

const ListboxWrapper = ({ children }: { children: ReactNode }) => (
  <div className="w-full px-1 py-2">
    {children}
  </div>
);

export default function SendPage() {
    const { globalUser } = useUser();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showListbox, setShowListbox] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedContactName, setSelectedContactName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openPopoverEmail, setOpenPopoverEmail] = useState<string | null>(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const globalUserEmail = globalUser?.email;
                const filteredContacts = data.filter((contact: Contact) => contact.email !== globalUserEmail);
                setContacts(filteredContacts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [globalUser]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteContact = (contactName: string) => {
        setSelectedContactName(contactName);
        onOpen();
    };

    const handleConfirmDelete = () => {
        // Add your delete logic here
        onClose();
    };

    const renderContacts = () => {
        if (loading) {
            return (
                <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center p-4 bg-gradient-to-tl from-default rounded-lg">
                            <Skeleton className="w-10 h-10 rounded-full mr-3" />
                            <div className="flex-1">
                                <Skeleton className="h-4 mb-2 w-60" />
                                <Skeleton className="h-2 w-40" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (filteredContacts.length === 0) {
            return <p>No contacts found.</p>;
        }
        return filteredContacts.map((contact: Contact) => (
            <div key={contact.email} className="flex flex-col">
                <div className="flex items-center justify-between p-4 bg-gradient-to-tl from-default rounded-lg">
                    <div className="flex items-center">
                        <img 
                            src={contact.image || '/path/to/default/image.png'}
                            alt={contact.name} 
                            className="w-10 h-10 rounded-full mr-3" 
                        />
                        <div>
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-default-300">{contact.bio || "No bio available"}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Popover isOpen={openPopoverEmail === contact.email} onOpenChange={(isOpen) => {
                            setOpenPopoverEmail(isOpen ? contact.email : null);
                        }} showArrow backdrop={"blur"} offset={6} placement="left">
                            <PopoverTrigger>
                                <Button
                                    className="text-foreground w-4"
                                    variant="light"
                                    isIconOnly
                                    onClick={() => setOpenPopoverEmail(contact.email)}
                                >
                                    <MoreVertical />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <ListboxWrapper>
                                    <Listbox aria-label="Actions" className="w-full items-centre justify-center min-w-[160px]">
                                        <ListboxItem key="view" className="text-center">View Profile</ListboxItem>
                                        <ListboxItem key="send" className="text-center">Send Money</ListboxItem>
                                        <ListboxItem key="request" className="text-center">Request Money</ListboxItem>
                                        <ListboxItem 
                                            key="delete" 
                                            className="text-danger text-center" 
                                            color="danger"
                                            onClick={() => {
                                                handleDeleteContact(contact.name);
                                                setOpenPopoverEmail(null);
                                            }}
                                        >
                                            Delete Contact
                                        </ListboxItem>
                                    </Listbox>
                                </ListboxWrapper>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        ));
    };

    const renderRecentContacts = () => {
        if (loading) {
            return (
                <div className="flex overflow-x-auto space-x-4 m-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex flex-row">
                            <Skeleton className="w-14 h-14 rounded-full" />
                        </div>
                    ))}
                </div>
            );
        }
        if (filteredContacts.length === 0) {
            return <p>No contacts found.</p>;
        }
        return (
            <div className="flex overflow-x-auto space-x-4 m-4">
                {filteredContacts.map((contact: Contact) => (
                    <div key={contact.email} className="flex flex-row">
                        {contact.image && <img src={contact.image} alt={contact.name} className="w-14 h-14 rounded-full" />}
                    </div>
                    
                ))}
            </div>
        );
    };

    const searchInput = (
        <Input
            aria-label="Search"
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
            }}
            endContent={
                <Kbd className="hidden lg:inline-block" keys={["command"]}>
                    K
                </Kbd>
            }
            labelPlacement="outside"
            placeholder="Search..."
            startContent={
                <Search className="text-base text-default-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
            onChange={handleSearch}
        />
    );

    return (
        <section className="flex flex-col w-full items-center justify-center">
            <div className="min-h-screen w-full max-w-2xl">
            <div className="">
                <Card isBlurred className="min-h-[640px]">
                    <CardBody>
                        <h1 className="text-3xl font-bold my-6 mx-2">Send Money</h1>
                        <div className="mx-2">{searchInput}</div>
                        <div className="mt-2 space-y-2">
                            <h2 className="text-xl font-semibold my-4 ml-4">Recent Contacts</h2>
                            {renderRecentContacts()}
                        </div>
                        <div className="mt-2 space-y-2">
                            <h2 className="text-xl font-semibold my-4 ml-4">All Contacts</h2>
                            {renderContacts()}
                        </div>
                        <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
                            <ModalContent>
                                <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                                <ModalBody>
                                    <p>Are you sure you want to delete {selectedContactName} as a contact?</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="light" onPress={onClose}>
                                        Cancel
                                    </Button>
                                    <Button color="primary" onPress={handleConfirmDelete}>
                                        Confirm
                                    </Button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                        {/* <RecentContacts /> */}
                    </CardBody>
                </Card>
                </div>
            </div>
        </section>
    );
}