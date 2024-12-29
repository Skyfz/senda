import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  if (!userId || !email) {
    return new Response('Missing userId or email', { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("test");
    
    const notifications = await db.collection('notifications').find({
      $or: [
        { to_user_id: userId },
        { to_email: email }
      ]
    }).sort({ created_at: -1 }).toArray();

    console.log('Found notifications:', notifications); // Debug log
    return new Response(JSON.stringify(notifications), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("notifications").deleteMany({
      $or: [
        { from_user_id: userId },
        { to_user_id: userId }
      ]
    });

    return NextResponse.json({
      message: "Notifications deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Notification deletion error:', error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
} 