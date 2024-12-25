'use client'

import { Card, CardBody, CardHeader, User} from '@nextui-org/react'
import { title, subtitle } from "@/components/primitives";
import { useUser } from '@/context/user-context';
import { Divider } from '@nextui-org/divider';
import ProfileForm from '@/components/profile-form';
import { Skeleton } from '@nextui-org/skeleton';


interface AccountClientProps {
  isRedirected: boolean
}

export default function AccountClient({
  isRedirected
}: AccountClientProps) {
  const { globalUser } = useUser();

  return (
    <div className="">
      <Card isBlurred className='w-full px-6'>
        <CardHeader className='flex'>
          <div className='flex-col w-full '>
            <div className='w-full py-8 lg:py-12'>
              <span className={title()}>Account</span>
            </div>
            <div className='w-full'>
              <User   
                name={globalUser?.name || 'Loading...'} 
                description={globalUser?.email || ''} 
                avatarProps={{src: globalUser?.image}}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {!globalUser ? (
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                <Skeleton className="w-full rounded-lg">
                  <div className="h-20 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
              <Skeleton className="w-full rounded-lg">
                <div className="h-32 rounded-lg bg-default-300"></div>
              </Skeleton>
              <div className="flex justify-end gap-2">
                <Skeleton className="w-20 rounded-lg">
                  <div className="h-10 rounded-lg bg-default-300"></div>
                </Skeleton>
              </div>
            </div>
          ) : (
            <ProfileForm />
          )}
        </CardBody>
      </Card>
    </div>
  )
}