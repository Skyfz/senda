'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  _id?: string;
  email: string;
  name?: string;
  image?: string;
  idNumber?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  accountStatus?: 'pending' | 'verified' | 'restricted';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserContextType {
  globalUser: User | null;
  setGlobalUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [globalUser, setGlobalUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/globUser');
        const data = await response.json();
        
        if (data.error === 'Not authenticated') {
          setGlobalUser(null);
          if (pathname !== '/signin') {
            router.push('/signin');
          }
          return;
        }

        // Set the user data with proper type checking
        if (data.user) {
          setGlobalUser(data.user);
        } else {
          setGlobalUser(null);
        }
        
        // Only redirect if user doesn't exist in DB and we're not already on the account page
        if (!data.exists && pathname !== '/account') {
          router.push('/account');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        setGlobalUser(null);
      }
    };

    checkUser();

    // Cleanup function
    return () => {
      setGlobalUser(null);
    };
  }, [router, pathname]); // Add pathname as a dependency

  return (
    <UserContext.Provider value={{ globalUser, setGlobalUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
