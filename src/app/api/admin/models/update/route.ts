import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { modelConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, modelId, displayName, description, icon, isEnabled } = body;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (modelId !== undefined) updateData.modelId = modelId;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled;

    await db
      .update(modelConfig)
      .set(updateData)
      .where(eq(modelConfig.category, category));

    console.log(`[Models] Updated model: ${category}`);

    return NextResponse.json({
      success: true,
      message: 'Model updated successfully',
    });
  } catch (error) {
    console.error('[Models] Error updating model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}
