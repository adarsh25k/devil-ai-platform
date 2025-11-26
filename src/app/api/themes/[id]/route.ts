import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid theme ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Query theme by ID
    const theme = await db
      .select()
      .from(themes)
      .where(eq(themes.id, parseInt(id)))
      .limit(1);

    // Check if theme exists
    if (theme.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Theme not found',
          code: 'THEME_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Return theme data
    return NextResponse.json(
      {
        success: true,
        theme: theme[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET theme error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}