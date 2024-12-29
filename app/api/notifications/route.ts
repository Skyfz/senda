import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: Request) {
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

    const notifications = await db.collection("notifications")
      .find({
        $or: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      })
      .sort({ created_at: -1 })
      .toArray();

    console.log('Found notifications:', notifications);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
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