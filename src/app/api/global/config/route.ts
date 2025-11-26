import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfig } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const configs = await db.select().from(globalConfig);

    const configObject = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      config: configObject
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}