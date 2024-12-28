import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("test")

    // Validate transaction ID
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      )
    }

    // Find transaction by ID
    const transaction = await db.collection("transactions").findOne({
      _id: new ObjectId(params.id)
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    // Get usernames for from_user_id and to_user_id if they exist
    const [fromUser, toUser] = await Promise.all([
      transaction.from_user_id ? db.collection("users").findOne({ _id: new ObjectId(transaction.from_user_id) }) : null,
      transaction.to_user_id ? db.collection("users").findOne({ _id: new ObjectId(transaction.to_user_id) }) : null
    ])

    // Return transaction with additional user details
    return NextResponse.json({
      ...transaction,
      from_username: fromUser?.name || null,
      to_username: toUser?.name || null
    })

  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
} 