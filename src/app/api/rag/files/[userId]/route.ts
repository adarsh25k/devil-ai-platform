import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ragFiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
          code: 'MISSING_USER_ID',
        },
        { status: 400 }
      );
    }

    const files = await db
      .select()
      .from(ragFiles)
      .where(eq(ragFiles.userId, userId))
      .orderBy(desc(ragFiles.createdAt));

    return NextResponse.json(
      {
        success: true,
        files,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET RAG files error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}