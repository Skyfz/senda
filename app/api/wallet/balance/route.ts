import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    // Get userId from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    //console.log('Fetching wallet balance for user:', userId);

    if (!userId) {
      console.log('No userId provided in request');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    
    const wallet = await db.collection("wallets").findOne({ userId });
    //console.log('Wallet found:', wallet);
    
    if (!wallet) {
      console.log('No wallet found for user:');
      // console.log('No wallet found for user:', userId);
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    //console.log('Returning wallet balance:', wallet.balance);
    return NextResponse.json({ balance: wallet.balance || 0 });
  } catch (error) {
    console.error('Failed to fetch wallet balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let body;
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    body = await request.json();
    const { amount, type } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return NextResponse.json({ error: 'Transaction type must be either "deposit" or "withdrawal"' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test");

    // First find the current wallet to get the existing balance
    const currentWallet = await db.collection("wallets").findOne({ userId });
    const currentBalance = currentWallet?.balance || 0;

    // Calculate new balance based on transaction type
    const newBalance = type === 'deposit' 
      ? currentBalance + amount 
      : currentBalance - amount;

    // Check if withdrawal would result in negative balance
    if (type === 'withdrawal' && newBalance < 0) {
      return NextResponse.json({ 
        error: 'Insufficient funds',
        currentBalance,
        requestedAmount: amount
      }, { status: 400 });
    }

    const result = await db.collection("wallets").updateOne(
      { userId },
      { 
        $set: { 
          balance: newBalance,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      previousBalance: currentBalance,
      transactionType: type,
      amount,
      newBalance,
      message: result.upsertedId 
        ? 'Wallet created' 
        : `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`
    });

  } catch (error) {
    console.error('Failed to update wallet balance:', error);
    return NextResponse.json({ 
      error: `Failed to process ${body?.type || 'transaction'}` 
    }, { status: 500 });
  }
}
