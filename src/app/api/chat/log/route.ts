import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatLogs } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, chat_id, message_role, message_content, model_used, tokens_in, tokens_out, routing_reason, latency } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ 
        error: "user_id is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!chat_id) {
      return NextResponse.json({ 
        error: "chat_id is required",
        code: "MISSING_CHAT_ID" 
      }, { status: 400 });
    }

    if (!message_role) {
      return NextResponse.json({ 
        error: "message_role is required",
        code: "MISSING_MESSAGE_ROLE" 
      }, { status: 400 });
    }

    if (!message_content) {
      return NextResponse.json({ 
        error: "message_content is required",
        code: "MISSING_MESSAGE_CONTENT" 
      }, { status: 400 });
    }

    // Validate message_role is either "user" or "assistant"
    if (message_role !== 'user' && message_role !== 'assistant') {
      return NextResponse.json({ 
        error: "message_role must be 'user' or 'assistant'",
        code: "INVALID_MESSAGE_ROLE" 
      }, { status: 400 });
    }

    // Insert into chat_logs table
    const newLog = await db.insert(chatLogs)
      .values({
        userId: user_id,
        chatId: chat_id,
        messageRole: message_role,
        messageContent: message_content,
        modelUsed: model_used || null,
        tokensIn: tokens_in || null,
        tokensOut: tokens_out || null,
        routingReason: routing_reason || null,
        latency: latency || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      log: newLog[0] 
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}