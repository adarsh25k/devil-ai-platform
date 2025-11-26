import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plugins } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const enabledPlugins = await db.select()
      .from(plugins)
      .where(eq(plugins.isEnabled, true));

    return NextResponse.json({
      success: true,
      plugins: enabledPlugins
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}