import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { uiTexts } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const texts = await db.select().from(uiTexts);

    return NextResponse.json({
      success: true,
      texts
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}