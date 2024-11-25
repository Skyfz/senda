import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MongoClient } from 'mongodb';
import { auth } from "@/auth"

// Interface for User document
interface User {
  email: string;
  name?: string;
  image?: string;
  idNumber?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  bio?: string;
  accountStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET() {
  try {
    const session = await auth();
    
    // If no session or email, user is not authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get auth data - this is our baseline user data
    const authUser = {
      email: session.user.email,
      name: session.user.name || '',
      image: session.user.image || ''
    };

    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db('test');
    
    // Check if user exists in database
    const dbUser = await db.collection<User>('users')
      .findOne({ email: authUser.email });
    
    if (!dbUser) {
      // User is authenticated but not in database
      // Return auth data as the user data with empty optional fields
      return NextResponse.json({
        exists: false,
        user: {
          ...authUser,
          idNumber: '',
          phoneNumber: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          bio: '',
          accountStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }, { status: 200 });
    }
    
    // Combine auth data with database data
    // Prefer auth data for name and image
    const fullUser = {
      ...dbUser,
      name: authUser.name || dbUser.name,
      image: authUser.image || dbUser.image,
      address: {
        ...dbUser.address,
        country: dbUser.address?.country || ''
      }
    };
    
    return NextResponse.json({
      exists: true,
      user: fullUser
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // If no session or email, user is not authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get the request body
    const userData = await request.json();

    // Connect to MongoDB
    const client: MongoClient = await clientPromise;
    const db = client.db('test');
    
    // Update or create user
    const result = await db.collection<User>('users').updateOne(
      { email: session.user.email },
      { 
        $set: {
          ...userData,
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: result.upsertedId ? 'User created' : 'User updated'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/globUser:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}