import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

// Types based on Ozow documentation
interface OzowNotification {
  SiteCode: string;
  TransactionId: string;
  TransactionReference: string;
  Amount: number;
  Status: string;
  Optional1?: string;
  Optional2?: string;
  Optional3?: string;
  Optional4?: string;
  Optional5?: string;
  CurrencyCode: string;
  IsTest: boolean;
  StatusMessage?: string;
  Hash: string;
  SubStatus?: string;
  MaskedAccountNumber?: string;
  BankName?: string;
  SmartIndicators?: string;
}

// Function to trim leading zeros from hash
function trimLeadingZeros(hash: string): string {
  return hash.replace(/^0+/, '');
}

function validateOzowHash(notification: OzowNotification): boolean {
  // Use test private key if env variable is not set
  const privateKey = process.env.OZOW_PRIVATE_KEY || 'test_private_key';
  
  // Concatenate variables in order
  const concatenated = [
    notification.SiteCode,
    notification.TransactionId,
    notification.TransactionReference,
    notification.Amount,
    notification.Status,
    notification.Optional1 || '',
    notification.Optional2 || '',
    notification.Optional3 || '',
    notification.Optional4 || '',
    notification.Optional5 || '',
    notification.CurrencyCode,
    notification.IsTest,
    notification.StatusMessage || ''
  ].join('');

  // Add private key and convert to lowercase
  const withKey = (concatenated + privateKey).toLowerCase();
  
  console.log('Validation:');
  console.log('Concatenated string:', concatenated);
  console.log('Private key:', privateKey);
  console.log('Final string:', withKey);
  
  // Generate SHA512 hash
  const calculatedHash = crypto.createHash('sha512')
    .update(withKey)
    .digest('hex');

  console.log('Calculated hash:', calculatedHash);
  console.log('Received hash:', notification.Hash);

  // Compare hashes (trim leading zeros)
  const result = trimLeadingZeros(calculatedHash) === trimLeadingZeros(notification.Hash);
  console.log('Hash comparison result:', result);
  
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const notification: OzowNotification = await req.json();

    // Validate hash
    if (!validateOzowHash(notification)) {
      console.error('Invalid hash received in Ozow notification');
      return NextResponse.json(
        { error: 'Invalid hash' },
        { status: 400 }
      );
    }

    // Connect to MongoDB using clientPromise
    const client = await clientPromise;
    const db = client.db("test");

    // Check for duplicate notification
    const existingNotification = await db
      .collection('notifications')
      .findOne({ TransactionId: notification.TransactionId });

    if (existingNotification) {
      console.log('Duplicate notification received:', notification.TransactionId);
      return NextResponse.json(
        { message: 'Notification already processed' },
        { status: 200 }
      );
    }

    const currentTime = new Date().toISOString();

    // Add timestamp and store notification
    const notificationWithTimestamp = {
      ...notification,
      created_at: currentTime,
      updated_at: currentTime,
      processed: false
    };

    await db.collection('notifications').insertOne(notificationWithTimestamp);

    // Process the notification based on status
    const status = notification.Status.toLowerCase();
    const updateData = {
      status,
      updated_at: currentTime
    };

    if (status === 'complete') {
      Object.assign(updateData, {
        completed_at: currentTime,
        ozow_transaction_id: notification.TransactionId
      });
    } else if (['cancelled', 'error', 'abandoned'].includes(status)) {
      Object.assign(updateData, {
        failed_at: currentTime,
        failure_reason: notification.StatusMessage || notification.SubStatus
      });
    } else if (['pendinginvestigation', 'pending'].includes(status)) {
      Object.assign(updateData, {
        pending_reason: notification.StatusMessage || notification.SubStatus
      });
    }

    // Update transaction
    await db.collection('transactions').updateOne(
      { transaction_reference: notification.TransactionReference },
      { $set: updateData }
    );

    // Mark notification as processed
    await db.collection('notifications').updateOne(
      { TransactionId: notification.TransactionId },
      { 
        $set: { 
          processed: true,
          processed_at: currentTime,
          updated_at: currentTime
        } 
      }
    );

    return NextResponse.json(
      { message: 'Notification processed successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing Ozow notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
