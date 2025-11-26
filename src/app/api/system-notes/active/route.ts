import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemNotes } from '@/db/schema';
import { eq, and, desc, or, isNull, lt } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentTimestamp = new Date().toISOString();

    // Query active system notes that haven't expired
    const notes = await db
      .select()
      .from(systemNotes)
      .where(
        and(
          eq(systemNotes.isActive, true),
          or(
            isNull(systemNotes.expiresAt),
            lt(systemNotes.expiresAt, currentTimestamp)
          )
        )
      )
      .orderBy(desc(systemNotes.createdAt));

    return NextResponse.json({
      success: true,
      notes
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}