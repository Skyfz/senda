import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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
      hash
    } = await req.json()

    // Find the transaction by transaction reference instead of ObjectId
    const transaction = await db.collection("transactions").findOne({
      transaction_reference: transactionReference
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Verify amount matches
    const totalAmount = transaction.amount + transaction.fee
    if (Number(amount) !== totalAmount) {
      return NextResponse.json(
        { error: "Amount mismatch" },
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

    // Update transaction status using transaction_reference
    await db.collection("transactions").updateOne(
      { transaction_reference: transactionReference },
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
      created_at: currentTime
    })

    // If transaction is complete, update wallet balance
    if (status.toLowerCase() === 'complete') {
      // Find the wallet first to ensure it exists
      const wallet = await db.collection("wallets").findOne({
        userId: transaction.to_user_id
      });

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
