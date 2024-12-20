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

    // If transaction is complete, update user's balance
    if (status.toLowerCase() === 'complete') {
      await db.collection("wallets").updateOne(
        { userId: new ObjectId(transaction.to_user_id) },
        {
          $inc: { balance: transaction.amount } // Only add the transaction amount, not including fee
        }
      )
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
