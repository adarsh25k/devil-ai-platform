import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      return NextResponse.json({
        success: true,
        stats: null
      });
    }

    return NextResponse.json({
      success: true,
      stats: stats[0]
    });

  } catch (error) {
    console.error('GET user stats error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}