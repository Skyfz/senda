import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("test")
    
    const { 
      transactionId,
      senderId,
      senderEmail,
      recipientId,
      recipientEmail,
      amount,
      fee,
      total,
      note,
      timestamp
    } = await req.json()

    // 1. Verify sender has sufficient balance
    const senderWallet = await db.collection("wallets").findOne({
      userId: senderId
    })

    if (!senderWallet || senderWallet.balance < total) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    // 2. Create transaction record with notification fields
    const transaction = await db.collection("transactions").insertOne({
      _id: new ObjectId(),
      transaction_id: transactionId,
      from_user_id: senderId,
      to_user_id: recipientId,
      from_email: senderEmail,
      to_email: recipientEmail,
      amount: amount,
      fee: fee,
      total: total,
      note: note,
      transaction_type: 'transfer',
      status: 'processing',
      created_at: timestamp,
      updated_at: timestamp
    })

    // Create notification record with more details
    const notification = {
      TransactionId: transactionId,
      TransactionReference: transaction.insertedId.toString(),
      Amount: total,
      Status: 'processing',
      created_at: timestamp,
      updated_at: timestamp,
      transaction_type: 'transfer',
      from_email: senderEmail,
      to_email: recipientEmail,
      note: note,
      from_user_id: senderId,
      to_user_id: recipientId
    }

    console.log('Created notification:', notification);

    await db.collection('notifications').insertOne(notification)

    // 3. Update sender's wallet (deduct amount)
    await db.collection("wallets").updateOne(
      { userId: senderId },
      {
        $inc: { balance: -total },
        $set: { updated_at: timestamp }
      }
    )

    // 4. Update recipient's wallet (add amount)
    const recipientWallet = await db.collection("wallets").findOne({
      userId: recipientId
    })

    if (!recipientWallet) {
      // Create wallet if it doesn't exist
      await db.collection("wallets").insertOne({
        userId: recipientId,
        balance: amount, // Only add the amount (not the fee)
        created_at: timestamp,
        updated_at: timestamp
      })
    } else {
      // Update existing wallet
      await db.collection("wallets").updateOne(
        { userId: recipientId },
        {
          $inc: { balance: amount }, // Only add the amount (not the fee)
          $set: { updated_at: timestamp }
        }
      )
    }

    // 5. Mark transaction as complete and update notification
    await db.collection("transactions").updateOne(
      { _id: transaction.insertedId },
      { 
        $set: { 
          status: 'complete',
          completed_at: timestamp,
          is_processed: true,
          processed_at: timestamp
        } 
      }
    )

    // Update notification status
    await db.collection('notifications').updateOne(
      { TransactionId: transactionId },
      { 
        $set: { 
          Status: 'complete',
          processed_at: timestamp
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: "Transfer completed successfully",
      transactionId: transaction.insertedId
    })

  } catch (error) {
    console.error('Error processing transfer:', error)
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    )
  }
} 