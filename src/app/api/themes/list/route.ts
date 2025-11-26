import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { themes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const enabledThemes = await db.select()
      .from(themes)
      .where(eq(themes.isEnabled, true));

    return NextResponse.json({
      success: true,
      themes: enabledThemes
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}