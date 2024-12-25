import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Db } from 'mongodb';

const usernameCache: { [key: string]: string } = {}; // Simple in-memory cache

async function getUsername(db: Db, userId: string): Promise<string> {
  if (usernameCache[userId]) {
    return usernameCache[userId]; // Return cached username if available
  }

  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  const username = user ? user.name : 'Unknown';
  usernameCache[userId] = username; // Cache the username
  return username;
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    // Extract userId from query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch transactions for the user with status 'complete'
    const transactions = await db.collection("transactions").find({
      $or: [
        { from_user_id: userId },
        { to_user_id: userId }
      ],
      status: 'complete' // Filter for transactions with status 'complete'
    }).toArray();

    // Fetch usernames for each transaction
    const transactionsWithUsernames = await Promise.all(transactions.map(async (tx) => {
      const fromUsername = await getUsername(db, tx.from_user_id);
      const toUsername = await getUsername(db, tx.to_user_id);
      return {
        ...tx,
        from_username: fromUsername,
        to_username: toUsername,
      };
    }));

    return NextResponse.json(transactionsWithUsernames);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 