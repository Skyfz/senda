import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

// Types based on Ozow documentation
interface OzowNotification {
  SiteCode: string;
  TransactionId: string;
  TransactionReference: string;
  Amount: string | number;
  Status: string;
  Optional1?: string;
  Optional2?: string;
  Optional3?: string;
  Optional4?: string;
  Optional5?: string;
  CurrencyCode: string;
  IsTest: boolean | string;
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
  const privateKey = process.env.OZOW_PRIVATE_KEY || '215114531AFF7134A94C88CEEA48E';
  
  // Ensure amount is a string with 2 decimal places if it's a number
  const amount = typeof notification.Amount === 'number' 
    ? notification.Amount.toFixed(2)
    : notification.Amount;

  // Convert IsTest to string 'true' or 'false'
  const isTest = String(notification.IsTest).toLowerCase();
  
  // Concatenate variables in exact order from docs (1-13)
  const concatenated = [
    notification.SiteCode,          // 1
    notification.TransactionId,     // 2
    notification.TransactionReference, // 3
    amount,                         // 4
    notification.Status,            // 5
    notification.Optional1 || '',   // 6
    notification.Optional2 || '',   // 7
    notification.Optional3 || '',   // 8
    notification.Optional4 || '',   // 9
    notification.Optional5 || '',   // 10
    notification.CurrencyCode,      // 11
    isTest,                        // 12
    notification.StatusMessage || '' // 13
  ].join('');

  // Add private key and convert to lowercase
  const withKey = (concatenated + privateKey).toLowerCase();
  
  console.log('Hash Validation Details:');
  console.log('1. Original Values:');
  console.log('  SiteCode:', notification.SiteCode);
  console.log('  TransactionId:', notification.TransactionId);
  console.log('  TransactionReference:', notification.TransactionReference);
  console.log('  Amount:', amount);
  console.log('  Status:', notification.Status);
  console.log('  CurrencyCode:', notification.CurrencyCode);
  console.log('  IsTest:', isTest);
  console.log('  StatusMessage:', notification.StatusMessage);
  
  console.log('\n2. Concatenated String (before lowercase):', concatenated);
  console.log('3. With Private Key (after lowercase):', withKey);
  
  // Generate SHA512 hash
  const calculatedHash = crypto.createHash('sha512')
    .update(withKey)
    .digest('hex');

  console.log('\n4. Hashes:');
  console.log('  Calculated:', calculatedHash);
  console.log('  Received: ', notification.Hash);
  
  // Compare hashes (trim leading zeros)
  const trimmedCalculated = trimLeadingZeros(calculatedHash);
  const trimmedReceived = trimLeadingZeros(notification.Hash);
  const result = trimmedCalculated === trimmedReceived;
  
  console.log('\n5. After trimming zeros:');
  console.log('  Calculated:', trimmedCalculated);
  console.log('  Received: ', trimmedReceived);
  console.log('  Match:', result);
  
  return result;
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const notification: OzowNotification = {
      SiteCode: formData.get('SiteCode') as string,
      TransactionId: formData.get('TransactionId') as string,
      TransactionReference: formData.get('TransactionReference') as string,
      Amount: formData.get('Amount') as string,
      Status: formData.get('Status') as string,
      Optional1: formData.get('Optional1') as string || '',
      Optional2: formData.get('Optional2') as string || '',
      Optional3: formData.get('Optional3') as string || '',
      Optional4: formData.get('Optional4') as string || '',
      Optional5: formData.get('Optional5') as string || '',
      CurrencyCode: formData.get('CurrencyCode') as string,
      IsTest: formData.get('IsTest') === 'true',
      StatusMessage: formData.get('StatusMessage') as string || '',
      Hash: formData.get('Hash') as string,
      SubStatus: formData.get('SubStatus') as string || '',
      MaskedAccountNumber: formData.get('MaskedAccountNumber') as string || '',
      BankName: formData.get('BankName') as string || '',
      SmartIndicators: formData.get('SmartIndicators') as string || ''
    };

    console.log('Received notification:', notification);

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
    const result = await db.collection('transactions').updateOne(
      { _id: new ObjectId(notification.TransactionReference) },
      { $set: updateData }
    );

    console.log('Transaction update result:', result);

    // Mark notification as processed
    await db.collection('notifications').updateOne(
      { TransactionId: notification.TransactionId },
      { 
        $set: { 
          processed: true,
          processed_at: currentTime
        }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Ozow notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
