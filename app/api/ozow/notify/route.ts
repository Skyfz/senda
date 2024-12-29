import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

// Types based on Ozow documentation
interface OzowNotification {
  SiteCode?: string;
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
  const privateKey = process.env.OZOW_PRIVATE_KEY;
  
  // Ensure amount is a string with 2 decimal places if it's a number
  const amount = typeof notification.Amount === 'number' 
    ? notification.Amount.toFixed(2)
    : notification.Amount;

  // Convert IsTest to string 'true' or 'false'
  const isTest = String(notification.IsTest).toLowerCase();
  
  // Concatenate variables in exact order from docs (1-13)
  const concatenated = [
    notification.SiteCode || '',          // 1
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
      TransactionId: formData.get('TransactionId') as string,
      TransactionReference: formData.get('TransactionReference') as string,
      Amount: formData.get('Amount') as string,
      Status: formData.get('Status') as string,
      CurrencyCode: formData.get('CurrencyCode') as string,
      IsTest: formData.get('IsTest') === 'true',
      Hash: formData.get('Hash') as string,
    };

    // Only add optional fields if they have values
    const optional1 = formData.get('Optional1') as string;
    if (optional1) notification.Optional1 = optional1;
    
    const optional2 = formData.get('Optional2') as string;
    if (optional2) notification.Optional2 = optional2;
    
    const optional3 = formData.get('Optional3') as string;
    if (optional3) notification.Optional3 = optional3;
    
    const optional4 = formData.get('Optional4') as string;
    if (optional4) notification.Optional4 = optional4;
    
    const optional5 = formData.get('Optional5') as string;
    if (optional5) notification.Optional5 = optional5;

    const statusMessage = formData.get('StatusMessage') as string;
    if (statusMessage) notification.StatusMessage = statusMessage;

    const subStatus = formData.get('SubStatus') as string;
    if (subStatus) notification.SubStatus = subStatus;

    const maskedAccountNumber = formData.get('MaskedAccountNumber') as string;
    if (maskedAccountNumber) notification.MaskedAccountNumber = maskedAccountNumber;

    const bankName = formData.get('BankName') as string;
    if (bankName) notification.BankName = bankName;

    const smartIndicators = formData.get('SmartIndicators') as string;
    if (smartIndicators) notification.SmartIndicators = smartIndicators;

    console.log('Received notification:', notification);

    // // Validate hash skipped for now will be implemenated later do not remove
    // if (!validateOzowHash(notification)) {
    //   console.error('Invalid hash received in Ozow notification');
    //   return NextResponse.json(
    //     { error: 'Invalid hash' },
    //     { status: 400 }
    //   );
    // }

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

    // Update notification format to match send notifications
    const notificationWithTimestamp = {
      TransactionId: notification.TransactionId,
      TransactionReference: notification.TransactionReference,
      Amount: notification.Amount, // Convert to number for UI
      Status: notification.Status.toLowerCase(), // Ensure consistent case
      created_at: currentTime,
      updated_at: currentTime,
      transaction_type: 'deposit',
      // Add note field for UI
      note: `${notification.BankName || 'Bank'} deposit ${notification.StatusMessage ? `- ${notification.StatusMessage}` : ''}`,
      // Add required email fields for UI
      to_email: notification.Optional2 || '', // Assuming Optional2 contains email
      from_email: notification.BankName || 'Bank Deposit',
      // Other fields...
      from_bank: notification.BankName || 'Unknown Bank',
      from_account: notification.MaskedAccountNumber || 'Unknown Account',
      status_message: notification.StatusMessage || '',
      sub_status: notification.SubStatus || '',
      is_test: notification.IsTest,
      currency: notification.CurrencyCode,
      smart_indicators: notification.SmartIndicators || '',
      user_id: notification.Optional1 || '', // Assuming Optional1 contains userId
      user_email: notification.Optional2 || '' // Assuming Optional2 contains email
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

    // Update notification status with processed timestamp and any additional info
    await db.collection('notifications').updateOne(
      { TransactionId: notification.TransactionId },
      { 
        $set: { 
          Status: status,
          processed_at: currentTime,
          status_message: notification.StatusMessage || '',
          sub_status: notification.SubStatus || '',
          // Add any status-specific fields
          ...(status === 'complete' && { completed_at: currentTime }),
          ...((['cancelled', 'error', 'abandoned'].includes(status)) && {
            failed_at: currentTime,
            failure_reason: notification.StatusMessage || notification.SubStatus
          }),
          ...((['pendinginvestigation', 'pending'].includes(status)) && {
            pending_reason: notification.StatusMessage || notification.SubStatus
          })
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
