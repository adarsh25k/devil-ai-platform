import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { splashConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const isValid = await verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Extract valid splash config fields
    const {
      videoUrl,
      backgroundImage,
      glowColor,
      duration,
      title,
      subtitle,
      screenShake,
      fireParticles,
      fogLayer,
      loadingMessages
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };

    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage;
    if (glowColor !== undefined) updateData.glowColor = glowColor;
    if (duration !== undefined) updateData.duration = duration;
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (screenShake !== undefined) updateData.screenShake = screenShake;
    if (fireParticles !== undefined) updateData.fireParticles = fireParticles;
    if (fogLayer !== undefined) updateData.fogLayer = fogLayer;
    if (loadingMessages !== undefined) updateData.loadingMessages = loadingMessages;

    // Check if record exists
    const existingConfig = await db.select()
      .from(splashConfig)
      .where(eq(splashConfig.id, 1))
      .limit(1);

    let result;

    if (existingConfig.length > 0) {
      // Update existing record
      const updated = await db.update(splashConfig)
        .set(updateData)
        .where(eq(splashConfig.id, 1))
        .returning();

      result = updated[0];
    } else {
      // Insert new record with id=1
      const inserted = await db.insert(splashConfig)
        .values({
          id: 1,
          videoUrl: videoUrl ?? null,
          backgroundImage: backgroundImage ?? null,
          glowColor: glowColor ?? null,
          duration: duration ?? 3,
          title: title ?? null,
          subtitle: subtitle ?? null,
          screenShake: screenShake ?? true,
          fireParticles: fireParticles ?? true,
          fogLayer: fogLayer ?? true,
          loadingMessages: loadingMessages ?? null,
          updatedAt: new Date().toISOString()
        })
        .returning();

      result = inserted[0];
    }

    return NextResponse.json({
      success: true,
      config: result
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}