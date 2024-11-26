import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

interface User {
  email: string;
  // Add other user properties here
}

export async function GET(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db('test');
    
    const users = await db.collection<User>('users')
      .find({})
      .toArray();
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No users found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client: MongoClient = await clientPromise;
    const db = client.db('test');
    const users = db.collection<User>('users');
    
    const data: User = await request.json();
    const result = await users.insertOne(data);
    
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: 'Failed to insert user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}