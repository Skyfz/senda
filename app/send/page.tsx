"use client";


import { Search,MoreVertical,ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { Button, Card, CardBody, Avatar, Input, Listbox, ListboxItem, Popover, PopoverTrigger, PopoverContent, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Skeleton,ScrollShadow, Divider, Textarea } from "@nextui-org/react";
import { Kbd } from "@nextui-org/kbd";
import { useUser } from '@/context/user-context';
import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface Contact {
    _id:    string;
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

const TRANSACTION_FEE_PERCENTAGE = 1; // 1%
const MINIMUM_FEE = 1; // R1 minimum fee
const MINIMUM_SEND_AMOUNT = 5; // R5 minimum send

const calculateFees = (inputAmount: string) => {
    const numAmount = Number(inputAmount) || 0;
    const calculatedFee = numAmount === 0 ? 0 : Math.max(
        MINIMUM_FEE,
        (numAmount * TRANSACTION_FEE_PERCENTAGE) / 100
    );
    return {
        amount: numAmount,
        fee: calculatedFee,
        total: numAmount + calculatedFee
    };
};

export default function SendPage() {
    const { globalUser } = useUser();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showListbox, setShowListbox] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedContactName, setSelectedContactName] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [openPopoverEmail, setOpenPopoverEmail] = useState<string | null>(null);
    const [step, setStep] = useState<number>(1);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [amountError, setAmountError] = useState<string | null>(null);
    const [transactionNote, setTransactionNote] = useState<string>("");
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                const filteredContacts = data.filter((contact: Contact) => 
                    contact.email !== globalUser?.email
                );
                setContacts(filteredContacts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (globalUser?.email) {
            fetchContacts();
        }
    }, [globalUser]);

    useEffect(() => {
        const fetchBalance = async () => {
            const result = await checkBalance();
            setBalance(result);
        };
        fetchBalance();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        contact.email !== globalUser?.email
    );

    const handleDeleteContact = (contactName: string) => {
        setSelectedContactName(contactName);
        onOpen();
    };

    const handleConfirmDelete = () => {
        // Add your delete logic here
        onClose();
    };

    
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

    const handleContactSelect = (contact: Contact) => {
        setSelectedContact(contact);
        setStep(2);
    };

    const renderContacts = () => {
        if (loading) {
            return (
                <div className="space-y-2">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-center p-4 bg-default-100 rounded-lg">
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
            <div 
                key={contact.email} 
                className="flex flex-col cursor-pointer"
                onClick={() => handleContactSelect(contact)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleContactSelect(contact);
                    }
                }}
            >
                <div className="flex items-center justify-between p-4 bg-default-100 rounded-lg">
                    <div className="flex items-center">
                        <img 
                            src={contact.image || '/path/to/default/image.png'}
                            alt={contact.name} 
                            className="w-10 h-10 rounded-full mr-3" 
                        />
                        <div>
                            <div className="font-semibold">{contact.name}</div>
                            <div className="text-default-400">{contact.bio || "No bio available"}</div>
                        </div>
                    </div>
                    <div 
                        role="button"
                        tabIndex={0}
                        className="flex space-x-2" 
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                            }
                        }}
                    >
                        <Popover 
                            isOpen={openPopoverEmail === contact.email} 
                            onOpenChange={(isOpen) => {
                                setOpenPopoverEmail(isOpen ? contact.email : null);
                            }} 
                            showArrow={true} 
                            backdrop={"blur"} 
                            offset={6} 
                            placement="left"
                        >
                            <PopoverTrigger>
                                <Button
                                    className="text-foreground w-4"
                                    variant="light"
                                    isIconOnly
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenPopoverEmail(contact.email);
                                    }}
                                >
                                    <MoreVertical />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent onClick={(e) => e.stopPropagation()}>
                                <ListboxWrapper>
                                    <Listbox aria-label="Actions" className="w-full items-centre justify-center min-w-[200px]">
                                        <ListboxItem key="view" className="text-left py-2">
                                            <p className="text-medium">View Profile</p>
                                        </ListboxItem>
                                        <ListboxItem key="send" className="text-left py-2">
                                            <p className="text-medium">Send Money</p>
                                        </ListboxItem>
                                        <ListboxItem key="request" className="text-left py-2">
                                            <p className="text-medium">Request Money</p>
                                        </ListboxItem>
                                        <ListboxItem 
                                            key="delete" 
                                            className="text-danger text-left py-2" 
                                            color="danger"
                                            onClick={() => {
                                                handleDeleteContact(contact.name);
                                                setOpenPopoverEmail(null);
                                            }}
                                        >
                                            <p className="text-medium">Delete Contact</p>
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
                <div className="flex overflow-x-auto space-x-6 m-6">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <Skeleton className="w-16 h-3" />
                        </div>
                    ))}
                </div>
            );
        }
        if (filteredContacts.length === 0) {
            return <p>No contacts found.</p>;
        }
        return (
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
              <div 
                key={index} 
                className="flex flex-col items-center gap-2 min-w-fit"
                onClick={() => handleContactSelect(contact)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleContactSelect(contact);
                    }
                }}
              >
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

    const checkBalance = async () => {
        try {
            const response = await fetch(`/api/wallet/balance?userId=${globalUser?._id}`);
            if (!response.ok) throw new Error('Failed to fetch balance');
            const data = await response.json();
            return data.balance || 0;
        } catch (error) {
            console.error('Error checking balance:', error);
            return 0;
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <>
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
                    </>
                );
            
            case 2:
                const calculations = calculateFees(amount);
                
                const validateAmount = (value: string) => {
                    const numAmount = Number(value);
                    if (!value) {
                        setAmountError("Please enter an amount");
                        return false;
                    }
                    if (numAmount < MINIMUM_SEND_AMOUNT) {
                        setAmountError(`Minimum amount is R${MINIMUM_SEND_AMOUNT.toFixed(2)}`);
                        return false;
                    }
                    setAmountError(null);
                    return true;
                };

                return (
                    <div className="p-4">
                        <div className="flex items-center mb-6">
                            <Button
                                isIconOnly
                                variant="light"
                                onClick={() => setStep(1)}
                                className="mr-4"
                            >
                                <ChevronLeft />
                            </Button>
                            <h1 className="text-3xl font-bold">Enter Amount</h1>
                        </div>

                        {selectedContact && (
                            <div className="flex items-center py-4 mb-6">
                                <img 
                                    src={selectedContact.image || '/path/to/default/image.png'}
                                    alt={selectedContact.name} 
                                    className="w-12 h-12 rounded-full mr-4" 
                                />
                                <div>
                                    <div className="font-semibold text-lg">{selectedContact.name}</div>
                                    <div className="text-default-500">{selectedContact.email}</div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Wallet className="w-5 h-5 text-default-500" />
                                <span className="text-sm font-medium">Amount to Send</span>
                            </div>
                            
                            <Input
                                size="lg"
                                color={amountError ? "danger" : "success"}
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                        setAmount(value);
                                        validateAmount(value);
                                    }
                                }}
                                variant="bordered"
                                startContent={
                                    <p className="text-default-400 pointer-events-none flex flex-col justify-center font-bold text-md">R</p>
                                }
                                className="w-full"
                                errorMessage={amountError}
                                isInvalid={!!amountError}
                            />

                            {/* Fee Breakdown Card */}
                            <Card isBlurred>
                                <CardBody className="gap-2">
                                    <div className="flex justify-between text-small">
                                        <span className="text-default-500">Amount:</span>
                                        <span>R {calculations.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-small">
                                        <span className="text-default-500">Service Fee ({TRANSACTION_FEE_PERCENTAGE}%):</span>
                                        <span>R {calculations.fee.toFixed(2)}</span>
                                    </div>
                                    <Divider className="my-2"/>
                                    <div className="flex justify-between font-medium">
                                        <span>Total:</span>
                                        <span>R {calculations.total.toFixed(2)}</span>
                                    </div>
                                    <div className="text-tiny text-default-400 mt-2">
                                        *Minimum send amount of R{MINIMUM_SEND_AMOUNT.toFixed(2)} applies<br/>
                                        *Minimum fee of R{MINIMUM_FEE.toFixed(2)} applies<br/>
                                        *Fees are non-refundable
                                    </div>
                                </CardBody>
                            </Card>

                            <Textarea
                                label="Note (optional)"
                                placeholder="Enter a message for this transaction"
                                className="w-full mt-4"
                                value={transactionNote}
                                onChange={(e) => setTransactionNote(e.target.value)}
                                maxLength={100}
                                maxRows={3}
                                variant="bordered"
                            />

                            <Button 
                                className="w-full"
                                color="success"
                                size="lg"
                                onClick={() => {
                                    if (validateAmount(amount)) {
                                        setStep(3);
                                    }
                                }}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                );
            
            case 3:
                const confirmationCalculations = calculateFees(amount);
                return (
                    <div className="p-4">
                        <div className="flex items-center mb-6">
                            <Button
                                isIconOnly
                                variant="light"
                                onClick={() => setStep(2)}
                                className="mr-4"
                            >
                                <ChevronLeft />
                            </Button>
                            <h1 className="text-3xl font-bold">Confirm Transaction</h1>
                        </div>

                        {selectedContact && (
                            <div className="space-y-6">
                                <div className="font-semibold text-md text-default-500">Sending&nbsp;To:</div>
                                <div className="flex items-center b-6">
                                    <img 
                                        src={selectedContact.image || '/path/to/default/image.png'}
                                        alt={selectedContact.name} 
                                        className="w-12 h-12 rounded-full mr-4" 
                                    />
                                    <div>
                                        <div className="font-semibold text-lg">{selectedContact.name}</div>
                                        <div className="text-default-500">{selectedContact.email}</div>
                                    </div>
                                </div>

                                    <Divider className="my-4"/>

                                    {/* Add Payment Method Selection */}
                                    <Card isBlurred className="">
                                        <CardBody className="">
                                            <h3 className="text-md font-semibold text-default-500 mb-2 -mt-4">Payment Method</h3>
                                            <div className="flex items-center justify-between p-2 border rounded-lg my-4">
                                                <div className="flex items-center gap-3">
                                                    <Wallet className="text-foreground" />
                                                    <div>
                                                        <p className="font-semibold">Wallet</p>
                                                        <p className="text-small text-default-500">
                                                            R {balance.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-4 h-4 rounded-full border-2 border-success bg-success"></div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 py-2">
                                                <div className="flex justify-between text-md">
                                                    <span className="text-default-500">Amount:</span>
                                                    <span className="font-semibold">R {confirmationCalculations.amount.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-md">
                                                    <span className="text-default-500">Service Fee ({TRANSACTION_FEE_PERCENTAGE}%):</span>
                                                    <span className="font-semibold">R {confirmationCalculations.fee.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <Divider className="my-2"/>
                                            <div className="flex justify-between text-lg font-bold my-2">
                                                <span>Total:</span>
                                                <span>R {confirmationCalculations.total.toFixed(2)}</span>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Add Transaction Note Display */}
                                    {transactionNote && (
                                        <Card isBlurred className="bg-default-50">
                                            <CardBody>
                                                <h3 className="text-md font-semibold text-default-500 mb-2">Transaction Note</h3>
                                                <p className="text-md">{transactionNote}</p>
                                            </CardBody>
                                        </Card>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mt-6">
                                <Button 
                                    className="w-full"
                                    color="success"
                                    size="lg"
                                    onClick={async () => {
                                        const currentBalance = await checkBalance();
                                        if (confirmationCalculations.total > currentBalance) {
                                            setError("Insufficient balance");
                                            alert(error)
                                            return;
                                        }
                                        
                                        // Proceed with transaction
                                        console.log({
                                            transactionId: Math.random().toString(36).substr(2, 9),
                                            senderId: globalUser?._id,
                                            senderEmail: globalUser?.email,
                                            recipientId: selectedContact?._id,
                                            recipientEmail: selectedContact?.email,
                                            amount: confirmationCalculations.amount,
                                            fee: confirmationCalculations.fee,
                                            total: confirmationCalculations.total,
                                            note: transactionNote,
                                            timestamp: new Date().toISOString()
                                        });
                                    }}
                                >
                                    Confirm & Pay
                                </Button>
                                <Button 
                                    className="w-full"
                                    variant="flat"
                                    size="lg"
                                    onClick={() => setStep(2)}
                                >
                                    Edit Details
                                </Button>
                            </div>
                        </div>
                );
        }
    };

    return (
        <section className="flex flex-col w-full items-center justify-center">
            <div className="min-h-screen w-full max-w-2xl">
                <div className="">
                    <Card isBlurred className="min-h-[640px]">
                        <CardBody>
                            {renderStep()}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </section>
    );
}