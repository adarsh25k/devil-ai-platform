import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chats, chatMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Delete all messages
    await db.delete(chatMessages).where(eq(chatMessages.chatId, chatId));

    // Delete chat
    await db.delete(chats).where(eq(chats.chatId, chatId));

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('[Chat] Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
