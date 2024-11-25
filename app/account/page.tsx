import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AccountClient from '@/app/account/account-client'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {


  return (
    <div className="w-full max-w-2xl mx-auto overflow-auto no-scrollbar">
      <AccountClient 
        isRedirected={searchParams.redirect === 'true'}
      />
    </div>
  )
}