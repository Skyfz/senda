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
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const body = await request.json();
    const { balance: depositAmount } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (typeof depositAmount !== 'number' || depositAmount <= 0) {
      return NextResponse.json({ error: 'Deposit amount must be a positive number' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("test");

    // First find the current wallet to get the existing balance
    const currentWallet = await db.collection("wallets").findOne({ userId });
    const currentBalance = currentWallet?.balance || 0;

    // Add the deposit amount to the current balance
    const newBalance = currentBalance + depositAmount;

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
      depositAmount,
      newBalance,
      message: result.upsertedId ? 'Wallet created' : 'Deposit successful'
    });

  } catch (error) {
    console.error('Failed to update wallet balance:', error);
    return NextResponse.json({ error: 'Failed to process deposit' }, { status: 500 });
  }
}
