import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

const ACTION_TYPES = {
  message: { field: 'totalMessages', xp: 10 },
  file_upload: { field: 'totalFilesUploaded', xp: 20 },
  code_run: { field: 'totalCodeRuns', xp: 15 }
} as const;

type ActionType = keyof typeof ACTION_TYPES;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action_type } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({
        error: 'user_id is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!action_type) {
      return NextResponse.json({
        error: 'action_type is required',
        code: 'MISSING_ACTION_TYPE'
      }, { status: 400 });
    }

    // Validate action_type
    if (!Object.keys(ACTION_TYPES).includes(action_type)) {
      return NextResponse.json({
        error: 'Invalid action_type. Must be one of: message, file_upload, code_run',
        code: 'INVALID_ACTION_TYPE'
      }, { status: 400 });
    }

    // Check if user stats exist
    const existingStats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, user_id))
      .limit(1);

    const now = new Date().toISOString();
    const actionConfig = ACTION_TYPES[action_type as ActionType];

    if (existingStats.length === 0) {
      // Create new user stats record
      const initialStats = {
        userId: user_id,
        xp: actionConfig.xp,
        level: Math.floor(actionConfig.xp / 100) + 1,
        streak: 0,
        lastLogin: now,
        badges: [],
        totalMessages: action_type === 'message' ? 1 : 0,
        totalFilesUploaded: action_type === 'file_upload' ? 1 : 0,
        totalCodeRuns: action_type === 'code_run' ? 1 : 0,
        createdAt: now,
        updatedAt: now
      };

      const newStats = await db.insert(userStats)
        .values(initialStats)
        .returning();

      return NextResponse.json({
        success: true,
        stats: newStats[0]
      }, { status: 201 });
    }

    // Update existing stats
    const currentStats = existingStats[0];
    const newXp = (currentStats.xp || 0) + actionConfig.xp;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updateData: any = {
      xp: newXp,
      level: newLevel,
      updatedAt: now
    };

    // Increment the appropriate counter
    switch (action_type) {
      case 'message':
        updateData.totalMessages = (currentStats.totalMessages || 0) + 1;
        break;
      case 'file_upload':
        updateData.totalFilesUploaded = (currentStats.totalFilesUploaded || 0) + 1;
        break;
      case 'code_run':
        updateData.totalCodeRuns = (currentStats.totalCodeRuns || 0) + 1;
        break;
    }

    const updatedStats = await db.update(userStats)
      .set(updateData)
      .where(eq(userStats.userId, user_id))
      .returning();

    if (updatedStats.length === 0) {
      return NextResponse.json({
        error: 'Failed to update user stats',
        code: 'UPDATE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: updatedStats[0]
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}