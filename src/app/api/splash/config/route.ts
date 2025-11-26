import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { splashConfig } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Query the splash_config table to get the first record
    const config = await db.select()
      .from(splashConfig)
      .limit(1);

    // If no config exists, return default values
    if (config.length === 0) {
      return NextResponse.json({
        success: true,
        config: {
          videoUrl: null,
          backgroundImage: null,
          glowColor: null,
          duration: 3,
          title: "I AM DEVIL",
          subtitle: "v2.0",
          screenShake: true,
          fireParticles: true,
          fogLayer: true,
          loadingMessages: ["Summoning demons...", "Loading chaos..."],
          updatedAt: new Date().toISOString()
        }
      }, { status: 200 });
    }

    // Return the existing config
    return NextResponse.json({
      success: true,
      config: config[0]
    }, { status: 200 });

  } catch (error) {
    console.error('GET splash config error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}