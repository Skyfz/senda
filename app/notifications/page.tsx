'use client';

import { Card, CardBody, Avatar, ScrollShadow, Button } from "@nextui-org/react"
import { Bell, ArrowUpRight, ArrowDownLeft, Check, AlertCircle, Trash2 } from 'lucide-react'
import { useUser } from '@/context/user-context'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Notification {
  _id: string
  TransactionId: string
  TransactionReference: string
  Amount: number
  Status: string
  created_at: string
  note?: string
  transaction_type?: string
  to_email?: string
  from_email?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { globalUser } = useUser()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!globalUser?._id) {
        console.log('No user ID available');
        return;
      }
      
      try {
        console.log('Fetching notifications for user:', globalUser._id);
        const response = await fetch(`/api/notifications?userId=${globalUser._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received notifications:', data);
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [globalUser?._id]);

  const getNotificationTitle = (notification: Notification) => {
    if (notification.transaction_type === 'transfer') {
      return notification.to_email === globalUser?.email ? 
        <>
          Money Received
          <br />
          <span className="text-default-500">from: {notification.from_email}</span>
        </> :
        <>
          Money Sent
          <br />
          <span className="text-default-500">to: {notification.to_email}</span>
        </>
    }
    return `Transaction ${notification.Status}`
  }

  const getNotificationIcon = (notification: Notification) => {
    if (notification.transaction_type === 'transfer') {
      return notification.to_email === globalUser?.email ? 
        <ArrowDownLeft className="w-6 h-6 text-success" /> :
        <ArrowUpRight className="w-6 h-6 text-success" />
    }
    return notification.Status === 'complete' ? 
      <Check className="w-6 h-6 text-success" /> :
      <AlertCircle className="w-6 h-6 text-warning" />
  }

  const handleDeleteAllNotifications = async () => {
    if (!globalUser?._id) return;
    
    if (!confirm('Are you sure you want to delete all notifications?')) return;

    try {
      const response = await fetch(`/api/notifications?userId=${globalUser._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Clear notifications from state
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  return (
    <section className="flex flex-col w-full items-center justify-center">
      <div className="min-h-screen w-full max-w-2xl">
        <Card className="bg-opacity-50">
          <CardBody className="py-5 px-4">
            <div className="flex justify-between items-center mb-4 px-2">
              <div>
                <h2 className="text-xl font-semibold pb-1">Notifications</h2>
                <p className="text-md text-default-500">Transaction updates and alerts</p>
              </div>
              {notifications.length > 0 && (
                <Button
                  isIconOnly
                  variant="light"
                  className="p-3 bg-danger/10 rounded-full"
                  onClick={handleDeleteAllNotifications}
                >
                  <Trash2 className="w-6 h-6 text-danger" />
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card key={notification._id} className="w-full">
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${
                          notification.Status === 'complete' ? 'bg-success/10' : 'bg-warning/10'
                        }`}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium">
                                {getNotificationTitle(notification)}
                            </p>
                            
                            {notification.note && (
                                <p className="text-xs text-default-500">
                                <span className="font-medium">Note: </span>
                                {notification.note}
                                </p>
                            )}
                            <p className="text-xs text-default-400">
                            {new Date(notification.created_at).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-xl text-success font-semibold">
                          R{notification.Amount}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                <div className="p-4 bg-default-100 rounded-full">
                  <Bell className="w-12 h-12 text-default-400" />
                </div>
                <h3 className="text-lg font-medium">No Notifications Yet</h3>
                <p className="text-sm text-default-500 max-w-sm">
                  Start a transaction to begin tracking your activity. You&apos;ll receive notifications for deposits, transfers, and other important updates.
                </p>
                
                <div className="flex gap-3 mt-4 w-full max-w-sm">
                  <Button
                    as={Link}
                    href="/deposit"
                    className="flex-1"
                    color="success"
                    variant="flat"
                    startContent={<ArrowDownLeft className="h-4 w-4" />}
                  >
                    Deposit
                  </Button>
                  <Button
                    as={Link}
                    href="/send"
                    className="flex-1"
                    color="primary"
                    variant="flat"
                    startContent={<ArrowUpRight className="h-4 w-4" />}
                  >
                    Send Money
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  )
} 