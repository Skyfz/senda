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
      ozowApiResponse  // This will be passed from the success page
    } = await req.json()

    // Find the notification by _id
    const notification = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionReference)
    })

    if (!notification) {
      console.log('Transaction notification not found:', transactionReference)
      return NextResponse.json(
        { error: "Transaction notification not found" },
        { status: 404 }
      )
    }

    // Check if transaction is already processed
    if (notification.is_processed) {
      console.log('Transaction already processed:', transactionReference)
      return NextResponse.json(
        { error: "Transaction already processed", status: notification.status },
        { status: 400 }
      )
    }

    // Verify all fields match between notification, API response, and success parameters
    const verificationErrors = []

    // Compare TransactionId
    if (ozowApiResponse.transactionId !== ozowTransactionId) {
      verificationErrors.push('Ozow TransactionId mismatch')
    }
    if (notification.ozow_transaction_id && notification.ozow_transaction_id !== ozowTransactionId) {
      verificationErrors.push('Notification TransactionId mismatch')
    }

    // Compare TransactionReference
    if (ozowApiResponse.transactionReference !== transactionReference) {
      verificationErrors.push('TransactionReference mismatch with API response')
    }

    // Compare Amount (converting to numbers for comparison)
    const apiAmount = Number(ozowApiResponse.amount)
    const notificationAmount = notification.amount + notification.fee
    const successAmount = Number(amount)

    if (apiAmount !== successAmount || apiAmount !== notificationAmount) {
      verificationErrors.push('Amount mismatch between API, notification, and success parameters')
    }

    // Compare Status
    if (ozowApiResponse.status.toLowerCase() !== status.toLowerCase()) {
      verificationErrors.push('Status mismatch with API response')
    }

    // Compare IsTest flag
    if (String(ozowApiResponse.isTest) !== String(isTest)) {
      console.log('Ozow isTest flag:', ozowApiResponse.isTest)
      console.log('Success isTest flag:', isTest)
      verificationErrors.push('IsTest flag mismatch')
    }

    // If any verification errors, return them
    if (verificationErrors.length > 0) {
      console.log('Verification errors:', verificationErrors)
      return NextResponse.json(
        { error: "Verification failed", details: verificationErrors },
        { status: 400 }
      )
    }

    const currentTime = new Date().toISOString()
    const updateData = {
      status: status.toLowerCase(),
      ozow_transaction_id: ozowTransactionId,
      status_message: statusMessage,
      is_test: isTest === 'true',
      hash: hash,
      updated_at: currentTime
    }

    // Add status-specific fields
    if (status.toLowerCase() === 'complete') {
      Object.assign(updateData, {
        completed_at: currentTime
      })
    } else if (['cancelled', 'error', 'abandoned'].includes(status.toLowerCase())) {
      Object.assign(updateData, {
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
        userId: notification.to_user_id
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
          userId: notification.to_user_id,
          balance: notification.amount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        // Update existing wallet
        await db.collection("wallets").updateOne(
          { userId: notification.to_user_id },
          {
            $inc: { balance: notification.amount },
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
