import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
export async function GET() {
  const db = await getDb();
  const docs = await db.collection('content_drafts').find({
    $or: [
      { "platformStatuses.linkedin": { $exists: true } },
      { "platformStatuses.x": { $exists: true } },
      { "platformStatuses.instagram": { $exists: true } }
    ]
  }).toArray();
  return NextResponse.json(docs.map(d => d.platformStatuses));
}
