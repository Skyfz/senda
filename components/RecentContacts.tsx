import React, { useRef, useEffect, useState } from 'react';
import { Card, CardBody, Avatar, ScrollShadow, Button, Divider } from "@nextui-org/react";
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/context/user-context';

interface Contact {
  image: string; // Add other properties as needed
  name: string;
  status: string; // Assuming status is a string, adjust if necessary
  email: string;
}

export default function RecentContacts() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { globalUser } = useUser();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
         const globalUserEmail = globalUser?.email;
         const filteredContacts = data.filter((contact: Contact) => contact.email !== globalUserEmail);
         setContacts(filteredContacts);
        console.log(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <Card className="bg-opacity-50">
      <CardBody className="py-5 px-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <div>
            <h2 className="text-lg font-semibold pb-1">Quick Send</h2>
            <p className="text-sm text-default-500">Recent contacts</p>
          </div>
          <div className="flex gap-2">
            <Button
              isIconOnly
              variant="flat"
              className="bg-default-100"
            >
              <Search size={18} />
            </Button>
            {/* <Button
              isIconOnly
              variant="flat"
              className="bg-default-100"
            >
              <Plus size={18} />
            </Button> */}
          </div>
        </div>
        <Divider className='my-2'/>
        
        <div className="relative">
          <Button
            isIconOnly
            variant="flat"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-default-100 hidden md:flex"
            size="sm"
            onClick={scrollLeft}
          >
            <ChevronLeft size={18} />
          </Button>

          <ScrollShadow 
            ref={scrollContainerRef}
            className="flex gap-6 py-2 overflow-x-scroll px-8 md:px-12" 
            orientation="horizontal"
            hideScrollBar
          >
            {contacts.map((contact, index) => (
              <div key={index} className="flex flex-col items-center gap-2 min-w-fit">
                <div className="relative p-1">
                  <Avatar
                    src={contact.image}
                    size="lg"
                    className="w-16 h-16 cursor-pointer hover:ring-2 ring-success transition-all"
                  />
                  <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                    contact.status === 'online' ? 'bg-success' : 'bg-default'
                  }`} />
                </div>
                <span className="text-sm font-medium">
                  {contact.name.split(' ')[0]} {contact.name.split(' ')[1]?.[0]}.
                </span>
              </div>
            ))}
          </ScrollShadow>
          <Button
            isIconOnly
            variant="flat"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-default-100 hidden md:flex"
            size="sm"
            onClick={scrollRight}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}