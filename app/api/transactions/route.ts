import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("test")
    const { 
      from_user_id,
      to_user_id,
      transaction_type,
      amount,
      fee = 0,
      currency = "ZAR",
      status = "pending"
    } = await req.json()

    // Validate required fields
    if (!transaction_type || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Calculate net amount
    const net_amount = Number(amount) + Number(fee)

    const currentTime = new Date().toISOString()

    const transaction = {
      from_user_id: from_user_id || null,
      to_user_id: to_user_id || null,
      transaction_type,
      amount: Number(amount),
      fee: Number(fee),
      net_amount,
      currency,
      status,
      created_at: currentTime,
      updated_at: currentTime
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return NextResponse.json({
      success: true,
      transaction_id: result.insertedId,
      ...transaction
    })

  } catch (error) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("test")
    
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')
    
    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Find transactions where user is either sender or receiver
    const transactions = await db.collection("transactions")
      .find({
        $or: [
          { from_user_id: user_id },
          { to_user_id: user_id }
        ]
      })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json(transactions)

  } catch (error) {
    console.error('Transaction fetch error:', error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
