import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modelConfig } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const models = await db.select().from(modelConfig);

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error('[Models] Error listing models:', error);
    return NextResponse.json(
      { error: 'Failed to list models' },
      { status: 500 }
    );
  }
}
