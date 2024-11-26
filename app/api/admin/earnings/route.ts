import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

let updateInterval: NodeJS.Timeout | null = null;

// Function to update earnings rate
async function updateEarningsRate() {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    
    // Generate random rate between 10-12
    const newRate = 12 + (Math.random() * 0.5);
    
    await db.collection("admin").updateOne(
      { type: "earningsRate" },
      { $set: { type: "earningsRate", rate: newRate, updatedAt: new Date() } },
      { upsert: true }
    );
    
    //console.log('Earnings rate updated successfully:', newRate);
    return newRate;
  } catch (error) {
    console.error('Failed to update earnings rate:', error);
    throw error;
  }
}

// Start the update interval if it's not already running
if (updateInterval === null) {
  updateInterval = setInterval(updateEarningsRate, 3600000); // Update every 5 seconds
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const earningsRate = await db.collection("admin").findOne({ type: "earningsRate" });
    
    if (!earningsRate?.rate) {
      // If no rate exists, create initial rate
      const initialRate = await updateEarningsRate();
      return NextResponse.json({ rate: initialRate });
    }
    
    return NextResponse.json({ rate: earningsRate.rate });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch earnings rate" }, { status: 500 });
  }
}

// Force an update
export async function PUT() {
  try {
    const newRate = await updateEarningsRate();
    return NextResponse.json({ rate: newRate });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update earnings rate" }, { status: 500 });
  }
}
