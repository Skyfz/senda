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
      hash
    } = await req.json()

    // Find the transaction
    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(transactionReference)
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

    // Update transaction status
    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionReference) },
      { 
        $set: { 
          status: status.toLowerCase(),
          ozow_transaction_id: ozowTransactionId,
          status_message: statusMessage,
          is_test: isTest === 'true',
          hash: hash,
          updated_at: new Date().toISOString()
        } 
      }
    )

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
      transaction_id: transactionReference,
      status: status.toLowerCase()
    })

  } catch (error) {
    console.error('Transaction verification error:', error)
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    )
  }
}
