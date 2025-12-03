import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const chatId = crypto.randomBytes(16).toString('hex');
    const now = new Date().toISOString();

    await db.insert(chats).values({
      chatId,
      userId,
      title: title || 'New Chat',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      chat: {
        chatId,
        userId,
        title: title || 'New Chat',
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    console.error('[Chat] Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}
