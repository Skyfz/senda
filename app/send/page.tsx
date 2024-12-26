"use client";

import { Search, X, MoreHorizontal, MoreVertical, Divide } from "lucide-react";
import { Button, Card, CardBody, Divider, Input } from "@nextui-org/react";
import { Kbd } from "@nextui-org/kbd";
import { useEffect, useState } from "react";
import { useUser } from '@/context/user-context';
import RecentContacts from "@/components/RecentContacts";

interface Contact {
    email: string; // Add other properties as needed
    name: string;
    image?: string; // Optional if it can be undefined
    status?: string; // Optional if it can be undefined
    bio?: string;   //
}

export default function SendPage() {
    const { globalUser } = useUser();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                const globalUserEmail = globalUser?.email;
                const filteredContacts = data.filter((contact: Contact) => contact.email !== globalUserEmail);
                setContacts(filteredContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
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

    const renderContacts = () => {
        if (filteredContacts.length === 0) {
            return <p>No contacts found.</p>;
        }
        return filteredContacts.map((contact: Contact) => (
            <div className="flex flex-col">
                <div key={contact.email} className="flex items-center justify-between p-4 border-1">
                    <div className="flex items-center">
                        {contact.image && <img src={contact.image} alt={contact.name} className="w-10 h-10 rounded-full mr-3" />}
                        <div>
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-default-300">{contact.bio || "No bio available"}</div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            className="text-foreground w-4"
                            onClick={() => {/* Open NextUI Listbox */ }}
                            variant="light"
                            isIconOnly
                        >
                            <MoreVertical />
                        </Button>
                        <Button
                            className="text-forground"
                            onClick={() => {/* Remove contact logic */ }}
                            variant="light"
                            isIconOnly
                        >
                            <X />
                        </Button>
                        
                    </div>
                    
                </div>
                <Divider/>
            </div>
        ));
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
        <div className="max-w-2xl">
            <Card >
                <CardBody>
                    <h1 className="text-3xl font-bold my-6 mx-2">Send Money</h1>
                    <div className="mx-2">{searchInput}</div>
                    <div className="mx-4 mt-2">
                        <h2 className="text-xl font-semibold my-4 ml-4">All Contacts</h2>
                        {renderContacts()}
                    </div>
                    {/* <RecentContacts /> */}
                </CardBody>
            </Card>
        </div>
    );
}