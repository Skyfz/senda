import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';

interface User {
  email: string;
}

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    // Fetch users from the 'users' collection
    const users = await db.collection("users").find({}).toArray();
    
    // Map through users to add initials fallback for missing images
    const formattedUsers = users.map(user => {
      const { name, image } = user;
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      return {
        ...user,
        image: image || `https://via.placeholder.com/150?text=${initials}`, // Fallback to initials
        status : 'online'
      };
    });

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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