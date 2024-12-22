import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("test")
    
    const { 
      transactionReference,
      ozowTransactionId,
      amount,
      status,
      statusMessage,
      isTest,
      hash,
      ozowApiResponse
    } = await req.json()

    // Find both the transaction and notification
    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionReference)
    })

    const notification = await db.collection("notifications").findOne({
      TransactionId: ozowTransactionId
    })

    if (!transaction) {
      console.log('Transaction not found:', transactionReference)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    if (!notification) {
      console.log('Notification not found for TransactionId:', ozowTransactionId)
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Check if transaction is already processed
    if (transaction.is_processed) {
      console.log('Transaction already processed:', transactionReference)
      return NextResponse.json(
        { error: "Transaction already processed", status: transaction.status },
        { status: 400 }
      )
    }

    // Verify all fields match between notification, API response, and success parameters
    const verificationErrors = []

    // Compare TransactionId
    if (ozowApiResponse.transactionId !== ozowTransactionId) {
      verificationErrors.push('Ozow TransactionId mismatch')
    }
    if (notification.TransactionId !== ozowTransactionId) {
      verificationErrors.push('Notification TransactionId mismatch')
    }

    // Compare TransactionReference
    if (ozowApiResponse.transactionReference !== transactionReference) {
      verificationErrors.push('TransactionReference mismatch with API response')
    }
    if (notification.TransactionReference !== transactionReference) {
      verificationErrors.push('TransactionReference mismatch with notification')
    }

    // Compare Amount (converting to numbers for comparison)
    const apiAmount = Number(ozowApiResponse.amount)
    const notificationAmount = Number(notification.Amount)
    const transactionAmount = transaction.amount + transaction.fee
    const successAmount = Number(amount)

    if (apiAmount !== successAmount || apiAmount !== transactionAmount || apiAmount !== notificationAmount) {
      verificationErrors.push('Amount mismatch between API, notification, transaction, and success parameters')
      console.log('Amount comparison:', {
        apiAmount,
        notificationAmount,
        transactionAmount,
        successAmount
      })
    }

    // Compare Status
    if (ozowApiResponse.status.toLowerCase() !== status.toLowerCase()) {
      verificationErrors.push('Status mismatch with API response')
    }
    if (notification.Status.toLowerCase() !== status.toLowerCase()) {
      verificationErrors.push('Status mismatch with notification')
    }

    // If any verification errors, return them
    if (verificationErrors.length > 0) {
      console.log('Verification errors:', verificationErrors)
      return NextResponse.json(
        { error: "Verification failed", details: verificationErrors },
        { status: 400 }
      )
    }

    interface UpdateData {
      status: any;
      ozow_transaction_id: any;
      status_message: any;
      is_test: boolean;
      hash: any;
      updated_at: string;
      masked_account_number: any;
      bank_name: any;
      to_bank_name: any;
      to_account_number: any;
      created_date: any;
      payment_date: any;
      sub_status: any;
      smart_indicators: any;
      [key: string]: any;
    }

    const currentTime = new Date().toISOString()
    const updateData: UpdateData = {
      status: status.toLowerCase(),
      ozow_transaction_id: ozowTransactionId,
      status_message: statusMessage,
      is_test: isTest === 'true',
      hash: hash,
      updated_at: currentTime,
      masked_account_number: ozowApiResponse.maskedAccountNumber,
      bank_name: ozowApiResponse.bankName,
      to_bank_name: ozowApiResponse.toBankName,
      to_account_number: ozowApiResponse.toAccountNumber,
      created_date: ozowApiResponse.createdDate,
      payment_date: ozowApiResponse.paymentDate,
      sub_status: ozowApiResponse.subStatus,
      smart_indicators: ozowApiResponse.smartIndicators
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Add status-specific fields
    if (status.toLowerCase() === 'complete') {
      Object.assign(updateData, {
        completed_at: currentTime
      })
    } else if (['cancelled', 'error', 'abandoned'].includes(status.toLowerCase())) {
      Object.assign(updateData, {
        reason: status.toLowerCase(),
        failed_at: currentTime,
        failure_reason: statusMessage
      })
    }

    // Update transaction status using _id
    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionReference) },
      { $set: updateData }
    )

    // Log verification
    await db.collection("verification_logs").insertOne({
      transaction_reference: transactionReference,
      ozow_transaction_id: ozowTransactionId,
      notification_id: notification._id,
      status,
      status_message: statusMessage,
      amount,
      is_test: isTest === 'true',
      hash,
      api_response: ozowApiResponse,
      created_at: currentTime
    })

    // If transaction is complete, update wallet balance
    if (status.toLowerCase() === 'complete') {
      // Find the wallet first to ensure it exists
      const wallet = await db.collection("wallets").findOne({
        userId: transaction.to_user_id
      });

      // Mark transaction as processed before updating wallet
      await db.collection("transactions").updateOne(
        { _id: new ObjectId(transactionReference) },
        { 
          $set: { 
            is_processed: true,
            processed_at: new Date().toISOString()
          } 
        }
      );

      if (!wallet) {
        // Create wallet if it doesn't exist
        await db.collection("wallets").insertOne({
          userId: transaction.to_user_id,
          balance: transaction.amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Update existing wallet
        await db.collection("wallets").updateOne(
          { userId: transaction.to_user_id },
          {
            $inc: { balance: transaction.amount },
            $set: { updated_at: new Date().toISOString() }
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Transaction verified successfully",
      status: status.toLowerCase()
    })

  } catch (error) {
    console.error('Error verifying transaction:', error)
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    )
  }
}
